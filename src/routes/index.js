const express = require('express');
const router = express.Router();
const {
  refreshCountries,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getSummaryImage
} = require('../controllers/countryController');

// Routes
router.post('/countries/refresh', refreshCountries);
router.get('/countries/image', getSummaryImage);
router.get('/countries/:name', getCountryByName);
router.get('/countries', getCountries);
router.delete('/countries/:name', deleteCountry);
router.get('/status', getStatus);

module.exports = router;
