# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
No authentication required.

---

## Endpoints

### 1. Root Endpoint

**GET** `/`

Get API information and available endpoints.

**Response:** `200 OK`
```json
{
  "message": "Country Currency & Exchange Rate API",
  "version": "1.0.0",
  "endpoints": {
    "POST /countries/refresh": "Fetch and cache country data",
    "GET /countries": "Get all countries (supports ?region, ?currency, ?sort)",
    "GET /countries/:name": "Get country by name",
    "DELETE /countries/:name": "Delete a country",
    "GET /status": "Get API status",
    "GET /countries/image": "Get summary image"
  }
}
```

---

### 2. Refresh Countries

**POST** `/countries/refresh`

Fetch country data and exchange rates from external APIs and cache them in the database. This endpoint also generates a summary image.

**Processing Time:** 30-60 seconds (depending on external API response)

**Success Response:** `200 OK`
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T12:00:00.000Z"
}
```

**Error Responses:**

`503 Service Unavailable` - External API unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from RestCountries API"
}
```

`500 Internal Server Error` - Database or processing error
```json
{
  "error": "Internal server error"
}
```

**Behavior:**
- Fetches data from RestCountries API
- Fetches exchange rates from Exchange Rate API
- For each country:
  - Extracts first currency code (or null if none)
  - Matches currency with exchange rate
  - Calculates estimated GDP: `population × random(1000-2000) ÷ exchange_rate`
  - Updates existing record or inserts new one (case-insensitive name matching)
- Generates summary image with top 5 countries by GDP
- Updates global last_refreshed_at timestamp

---

### 3. Get All Countries

**GET** `/countries`

Retrieve all countries from the database with optional filtering and sorting.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `region` | string | Filter by region | `?region=Africa` |
| `currency` | string | Filter by currency code | `?currency=NGN` |
| `sort` | string | Sort order | `?sort=gdp_desc` |

**Sort Options:**
- `gdp_desc` - By estimated GDP (descending)
- `gdp_asc` - By estimated GDP (ascending)
- `name_asc` - By name (A-Z)
- `name_desc` - By name (Z-A)
- `population_desc` - By population (descending)
- `population_asc` - By population (ascending)

**Examples:**
```bash
GET /countries
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Africa&sort=gdp_desc
```

**Success Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-26T12:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Ghana",
    "capital": "Accra",
    "region": "Africa",
    "population": 31072940,
    "currency_code": "GHS",
    "exchange_rate": 15.34,
    "estimated_gdp": 3029834520.6,
    "flag_url": "https://flagcdn.com/gh.svg",
    "last_refreshed_at": "2025-10-26T12:00:00.000Z"
  }
]
```

**Error Response:**

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 4. Get Country by Name

**GET** `/countries/:name`

Retrieve a specific country by name (case-insensitive).

**Parameters:**
- `name` (path) - Country name (URL encoded for names with spaces)

**Examples:**
```bash
GET /countries/Nigeria
GET /countries/United%20States
GET /countries/south%20africa
```

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-26T12:00:00.000Z"
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "Country not found"
}
```

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 5. Delete Country

**DELETE** `/countries/:name`

Delete a country record from the database (case-insensitive).

**Parameters:**
- `name` (path) - Country name (URL encoded for names with spaces)

**Examples:**
```bash
DELETE /countries/Nigeria
DELETE /countries/United%20States
```

**Success Response:** `200 OK`
```json
{
  "message": "Country deleted successfully"
}
```

**Error Responses:**

`404 Not Found`
```json
{
  "error": "Country not found"
}
```

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 6. Get Status

**GET** `/status`

Get API status including total countries cached and last refresh timestamp.

**Success Response:** `200 OK`
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T12:00:00.000Z"
}
```

**Note:** `last_refreshed_at` will be `null` if no refresh has been performed yet.

**Error Response:**

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

### 7. Get Summary Image

**GET** `/countries/image`

Retrieve the generated summary image showing:
- Total number of countries
- Top 5 countries by estimated GDP
- Last refresh timestamp

**Success Response:** `200 OK`

Content-Type: `image/svg+xml` or `application/json`

Returns an SVG image or JSON summary.

**SVG Example:**
```xml
<svg width="800" height="600">
  <!-- Visual summary of countries -->
</svg>
```

**JSON Fallback:**
```json
{
  "title": "Country Exchange Rate Summary",
  "total_countries": 250,
  "top_5_countries_by_gdp": [
    {
      "rank": 1,
      "name": "United States",
      "currency_code": "USD",
      "estimated_gdp": "450000000000.00"
    }
  ],
  "last_refreshed": "2025-10-26T12:00:00.000Z",
  "generated_at": "2025-10-26T12:01:00.000Z"
}
```

**Error Responses:**

`404 Not Found` - No summary has been generated yet
```json
{
  "error": "Summary image not found"
}
```

`500 Internal Server Error`
```json
{
  "error": "Internal server error"
}
```

---

## Data Models

### Country Object

```typescript
{
  id: number;                    // Auto-generated primary key
  name: string;                  // Country name (required, unique)
  capital: string | null;        // Capital city (optional)
  region: string | null;         // Geographic region (optional)
  population: number;            // Population count (required)
  currency_code: string | null;  // ISO currency code (required*)
  exchange_rate: number | null;  // Exchange rate to USD (required*)
  estimated_gdp: number | null;  // Calculated GDP (required*)
  flag_url: string | null;       // Flag image URL (optional)
  last_refreshed_at: string;     // ISO timestamp of last update
}
```

*Note: Can be null if country has no currency or currency not found in exchange API

---

## Error Handling

All errors return a JSON object with an `error` field:

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request | Validation failed |
| 404 | Not Found | Country or resource not found |
| 500 | Internal Server Error | Database or processing error |
| 503 | Service Unavailable | External API unavailable |

---

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting in production.

---

## External APIs

### RestCountries API
```
GET https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
```

### Exchange Rate API
```
GET https://open.er-api.com/v6/latest/USD
```

Both APIs are rate-limited. Please be mindful of usage.

---

## Best Practices

1. **Initial Setup:** Run `POST /countries/refresh` after deployment
2. **Caching:** Data is cached until next refresh
3. **Filtering:** Use query parameters for efficient filtering
4. **Naming:** Country names are case-insensitive
5. **Images:** Summary image is regenerated on each refresh

---

## Testing with cURL

```bash
# Refresh data
curl -X POST http://localhost:3000/countries/refresh

# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl "http://localhost:3000/countries?region=Africa"

# Get specific country
curl http://localhost:3000/countries/Nigeria

# Get status
curl http://localhost:3000/status

# Download summary image
curl http://localhost:3000/countries/image -o summary.svg
```

---

## Testing with JavaScript (Fetch API)

```javascript
// Refresh data
fetch('http://localhost:3000/countries/refresh', {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));

// Get countries
fetch('http://localhost:3000/countries?region=Africa')
  .then(res => res.json())
  .then(data => console.log(data));

// Get specific country
fetch('http://localhost:3000/countries/Nigeria')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Support

For issues or questions, please create an issue in the GitHub repository.
