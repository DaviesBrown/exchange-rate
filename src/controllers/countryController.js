const { pool } = require('../config/database');
const { fetchCountries, fetchExchangeRates } = require('../services/externalApi');
const { generateSummaryImage } = require('../services/imageGeneratorSimple');

// POST /countries/refresh
async function refreshCountries(req, res) {
  const connection = await pool.getConnection();
  
  try {
    // Fetch data from external APIs
    const [countriesData, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);
    
    await connection.beginTransaction();
    
    const refreshTimestamp = new Date();
    let processedCount = 0;
    
    for (const country of countriesData) {
      const { name, capital, region, population, flag, currencies } = country;
      
      // Validate required fields
      if (!name || !population) {
        continue;
      }
      
      let currencyCode = null;
      let exchangeRate = null;
      let estimatedGdp = null;
      
      // Handle currency
      if (currencies && currencies.length > 0) {
        currencyCode = currencies[0].code;
        
        // Get exchange rate
        if (currencyCode && exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
          
          // Calculate estimated GDP
          const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
          estimatedGdp = (population * randomMultiplier) / exchangeRate;
        }
      } else {
        // No currencies - set GDP to 0
        estimatedGdp = 0;
      }
      
      // Insert or update country
      await connection.query(
        `INSERT INTO countries 
         (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         capital = VALUES(capital),
         region = VALUES(region),
         population = VALUES(population),
         currency_code = VALUES(currency_code),
         exchange_rate = VALUES(exchange_rate),
         estimated_gdp = VALUES(estimated_gdp),
         flag_url = VALUES(flag_url),
         last_refreshed_at = VALUES(last_refreshed_at)`,
        [name, capital || null, region || null, population, currencyCode, exchangeRate, estimatedGdp, flag || null, refreshTimestamp]
      );
      
      processedCount++;
    }
    
    // Update metadata
    await connection.query(
      `UPDATE metadata SET last_refreshed_at = ?, total_countries = ? WHERE id = 1`,
      [refreshTimestamp, processedCount]
    );
    
    await connection.commit();
    
    // Generate summary image
    const [topCountries] = await connection.query(
      `SELECT name, currency_code, estimated_gdp 
       FROM countries 
       WHERE estimated_gdp IS NOT NULL 
       ORDER BY estimated_gdp DESC 
       LIMIT 5`
    );
    
    await generateSummaryImage({
      totalCountries: processedCount,
      topCountries,
      lastRefreshed: refreshTimestamp
    });
    
    res.status(200).json({
      message: 'Countries refreshed successfully',
      total_countries: processedCount,
      last_refreshed_at: refreshTimestamp.toISOString()
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Refresh error:', error);
    
    if (error.message.includes('Could not fetch data')) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: error.message
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

// GET /countries
async function getCountries(req, res) {
  try {
    const { region, currency, sort } = req.query;
    
    let query = 'SELECT * FROM countries WHERE 1=1';
    const params = [];
    
    // Filter by region
    if (region) {
      query += ' AND LOWER(region) = LOWER(?)';
      params.push(region);
    }
    
    // Filter by currency
    if (currency) {
      query += ' AND UPPER(currency_code) = UPPER(?)';
      params.push(currency);
    }
    
    // Sorting
    if (sort === 'gdp_desc') {
      query += ' ORDER BY estimated_gdp DESC';
    } else if (sort === 'gdp_asc') {
      query += ' ORDER BY estimated_gdp ASC';
    } else if (sort === 'name_asc') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'name_desc') {
      query += ' ORDER BY name DESC';
    } else if (sort === 'population_desc') {
      query += ' ORDER BY population DESC';
    } else if (sort === 'population_asc') {
      query += ' ORDER BY population ASC';
    } else {
      query += ' ORDER BY name ASC';
    }
    
    const [countries] = await pool.query(query, params);
    
    // Format response
    const formattedCountries = countries.map(country => ({
      id: country.id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: country.population,
      currency_code: country.currency_code,
      exchange_rate: country.exchange_rate ? parseFloat(country.exchange_rate) : null,
      estimated_gdp: country.estimated_gdp ? parseFloat(country.estimated_gdp) : null,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at ? country.last_refreshed_at.toISOString() : null
    }));
    
    res.status(200).json(formattedCountries);
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /countries/:name
async function getCountryByName(req, res) {
  try {
    const { name } = req.params;
    
    const [countries] = await pool.query(
      'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    
    if (countries.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    const country = countries[0];
    const formattedCountry = {
      id: country.id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: country.population,
      currency_code: country.currency_code,
      exchange_rate: country.exchange_rate ? parseFloat(country.exchange_rate) : null,
      estimated_gdp: country.estimated_gdp ? parseFloat(country.estimated_gdp) : null,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at ? country.last_refreshed_at.toISOString() : null
    };
    
    res.status(200).json(formattedCountry);
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /countries/:name
async function deleteCountry(req, res) {
  try {
    const { name } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    // Update total countries in metadata
    const [[metadata]] = await pool.query('SELECT total_countries FROM metadata WHERE id = 1');
    await pool.query(
      'UPDATE metadata SET total_countries = ? WHERE id = 1',
      [Math.max(0, metadata.total_countries - 1)]
    );
    
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Delete country error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /status
async function getStatus(req, res) {
  try {
    const [[metadata]] = await pool.query('SELECT * FROM metadata WHERE id = 1');
    
    res.status(200).json({
      total_countries: metadata.total_countries || 0,
      last_refreshed_at: metadata.last_refreshed_at ? metadata.last_refreshed_at.toISOString() : null
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /countries/image
async function getSummaryImage(req, res) {
  try {
    const path = require('path');
    const fs = require('fs').promises;
    
    // Check for SVG image - cache is in project root
    const svgPath = path.join(__dirname, '../../cache/summary.svg');
    const jsonPath = path.join(__dirname, '../../cache/summary.json');
    
    try {
      await fs.access(svgPath);
      res.setHeader('Content-Type', 'image/svg+xml');
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      res.send(svgContent);
    } catch (error) {
      // If SVG not found, try returning JSON summary
      try {
        await fs.access(jsonPath);
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonContent);
      } catch (err) {
        res.status(404).json({ error: 'Summary image not found' });
      }
    }
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  refreshCountries,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getSummaryImage
};
