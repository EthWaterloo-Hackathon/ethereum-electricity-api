# ethereum-electricity-api
API that supplies ethereum energy consumption and carbon footprint per transaction data

## Endpoints
All endpoints return a single value wrapped in a JSON object { result: value }

### /electricity-consumption
Returns the avg MWh consumed per transaction (**E**)

### /grid-emission-factor
Returns China's nationwide grid emission factor in tons of CO2 per MWh (**F**)

### /gas-usage
Returns the avg gas spent per transaction calculated from the last 500k blocks (**G**)

## Formula

The formula for calculating tons of carbon emission per unit of gas is `(F*E)/G`