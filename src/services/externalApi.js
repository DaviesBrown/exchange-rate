const axios = require('axios');

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

// Fetch countries data
async function fetchCountries() {
  try {
    const response = await axios.get(COUNTRIES_API, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    throw new Error('Could not fetch data from RestCountries API');
  }
}

// Fetch exchange rates
async function fetchExchangeRates() {
  try {
    const response = await axios.get(EXCHANGE_RATE_API, { timeout: 30000 });
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    throw new Error('Could not fetch data from Exchange Rate API');
  }
}

module.exports = {
  fetchCountries,
  fetchExchangeRates
};
