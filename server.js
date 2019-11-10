const express = require('express');
const needle = require('needle');
const cheerio = require('cheerio');
const utils = require('web3-utils');

const app = express();

const BLOCK_LIMIT = 500000;
let latestBlocks = [];
let gasAverage = 0;

const getLatestBlock = () => {
  needle.post('http://mainnet.mudit.blog/', {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: ['latest', true],
    id: '1',
  }, {
    content_type: 'application/json',
  }, (_err, resp) => {
    if (_err) {
      console.error(_err);
      return;
    }

    const { transactions, gasUsed, number } = resp.body.result;
    const blockNumber = utils.hexToNumber(number);
    const avgGasPerTransaction = utils.hexToNumber(gasUsed)/transactions.length;

    if (!latestBlocks.find(({ blockNumber: block }) => block === blockNumber)) {
      if (latestBlocks.length >= BLOCK_LIMIT) {
        latestBlocks.shift();
      }
      latestBlocks.push({
        blockNumber,
        avgGasPerTransaction,
      });

      console.log(`Calculating gas average for ${latestBlocks.length} blocks`);
      const sum = latestBlocks.reduce((prev, cur) => {
        return prev + (cur.avgGasPerTransaction || 0);
      }, 0);
      const avg = Math.floor(sum / latestBlocks.length);

      // For debugging purposes. For some reason the value becomes null at some point
      if (isNaN(avg)) {
        console.log(`Null average, sum was ${sum}.`);
        console.log(`Latest block was ${blockNumber}, latest transaction gas average was ${avgGasPerTransaction}.`);
      } else {
        gasAverage = avg;
        console.log(`New gas average is ${gasAverage}.`);
      }            
    }

    setTimeout(() => getLatestBlock(), 1000);
  });
};

getLatestBlock();

app.get('/electricity-consumption', async (_req, res) => {
  needle.get('https://digiconomist.net/ethereum-energy-consumption', (_err, resp) => {
    if (_err) {
      res.status(500).send('Something horrible has happened, all we can do is pray');
    }

    const $ = cheerio.load(resp.body);
    const node = $('#table_31_row_8 td:last-child');    
    
    res.json({ result: parseInt(node.text(), 10)/1000 });
  });
});

app.get('/grid-emission-factor', async (_req, res) => {
  res.json({ result: 0.861 });
});

app.get('/gas-usage', async (_req, res) => {
  res.json({ result: gasAverage });
});

app.listen(process.env.PORT || 3000, () => console.log('listening'));