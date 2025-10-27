const fs = require('fs').promises;
const path = require('path');

async function generateSummaryImage(data) {
  const { totalCountries, topCountries, lastRefreshed } = data;

  const summary = {
    title: 'Country Exchange Rate Summary',
    total_countries: totalCountries,
    top_5_countries_by_gdp: topCountries.map((country, index) => ({
      rank: index + 1,
      name: country.name,
      currency_code: country.currency_code,
      estimated_gdp: parseFloat(country.estimated_gdp).toFixed(2)
    })),
    last_refreshed: new Date(lastRefreshed).toISOString(),
    generated_at: new Date().toISOString()
  };

  const cacheDir = path.join(__dirname, '../../cache');
  await fs.mkdir(cacheDir, { recursive: true });
  
  const jsonPath = path.join(cacheDir, 'summary.json');
  await fs.writeFile(jsonPath, JSON.stringify(summary, null, 2));

  const svg = generateSVGImage(data);
  const svgPath = path.join(cacheDir, 'summary.svg');
  await fs.writeFile(svgPath, svg);
  
  return svgPath;
}

function generateSVGImage(data) {
  const { totalCountries, topCountries, lastRefreshed } = data;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="600" fill="#1a1a2e"/>
  
  <!-- Title -->
  <text x="400" y="60" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
        fill="#eaeaea" text-anchor="middle">
    Country Exchange Rate Summary
  </text>
  
  <!-- Total Countries -->
  <text x="400" y="110" font-family="Arial, sans-serif" font-size="24" 
        fill="#16c784" text-anchor="middle">
    Total Countries: ${totalCountries}
  </text>
  
  <!-- Top 5 Header -->
  <text x="400" y="160" font-family="Arial, sans-serif" font-size="26" font-weight="bold" 
        fill="#eaeaea" text-anchor="middle">
    Top 5 Countries by Estimated GDP
  </text>
  
  ${topCountries.map((country, index) => {
    const yPos = 210 + (index * 50);
    const gdp = parseFloat(country.estimated_gdp).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `
  <!-- Rank ${index + 1} -->
  <text x="50" y="${yPos}" font-family="Arial, sans-serif" font-size="18" 
        fill="#ffd700" text-anchor="start">
    ${index + 1}.
  </text>
  
  <text x="90" y="${yPos}" font-family="Arial, sans-serif" font-size="18" 
        fill="#eaeaea" text-anchor="start">
    ${escapeXML(country.name)}
  </text>
  
  <text x="400" y="${yPos}" font-family="Arial, sans-serif" font-size="18" 
        fill="#16c784" text-anchor="start">
    $${gdp}
  </text>
  
  <text x="650" y="${yPos}" font-family="Arial, sans-serif" font-size="16" 
        fill="#9ca3af" text-anchor="start">
    (${country.currency_code})
  </text>`;
  }).join('\n')}
  
  <!-- Last Refreshed -->
  <text x="400" y="560" font-family="Arial, sans-serif" font-size="16" 
        fill="#9ca3af" text-anchor="middle">
    Last Refreshed: ${new Date(lastRefreshed).toISOString()}
  </text>
</svg>`;

  return svg;
}

function escapeXML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { generateSummaryImage };
