const express = require('express');
const needle = require('needle');
const cheerio = require('cheerio');

const app = express();
app.get('/consumption', async (_req, res) => {
  needle.get('https://digiconomist.net/ethereum-energy-consumption', (_err, resp) => {
    const $ = cheerio.load(resp.body);
    const node = $('#table_31_row_8 td:last-child');    
    
    res.json({ result: parseInt(node.text(), 10) });
  });
});

app.listen(process.env.PORT || 3000, () => console.log('listening'));