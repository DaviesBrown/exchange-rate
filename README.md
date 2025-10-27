# Country Currency & Exchange Rate API

A RESTful API that fetches country data and exchange rates from external APIs, stores them in a MySQL database, and provides CRUD operations with advanced filtering and sorting capabilities.

## 🚀 Features

- Fetch and cache country data with currency exchange rates
- Calculate estimated GDP based on population and exchange rates
- Filter countries by region and currency
- Sort countries by GDP, population, or name
- Generate summary images with top countries
- Full CRUD operations
- Comprehensive error handling
- MySQL database persistence

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd exchange-rate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL Database

Create a new MySQL database and dedicated user:

```bash
# Login to MySQL as root
sudo mysql

# Run the setup script
source database/setup.sql;
exit
```

**Note:** Edit `database/setup.sql` first to set a strong password for the `exchange_api_user`.

### 4. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
PORT=3000

DB_HOST=localhost
DB_USER=exchange_api_user
DB_PASSWORD=your_secure_password
DB_NAME=exchange_rate_db
DB_PORT=3306

NODE_ENV=development
```

**Important:** Use the same password you set when creating the MySQL user.

### 5. Run the Application

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. **POST** `/countries/refresh`
Fetch all countries and exchange rates, then cache them in the database.

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T12:00:00.000Z"
}
```

**Error Responses:**
- `503 Service Unavailable` - External API unavailable
- `500 Internal Server Error` - Database or processing error

---

#### 2. **GET** `/countries`
Get all countries from the database with optional filters and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort results:
  - `gdp_desc` - By GDP descending
  - `gdp_asc` - By GDP ascending
  - `name_asc` - By name A-Z
  - `name_desc` - By name Z-A
  - `population_desc` - By population descending
  - `population_asc` - By population ascending

**Example Requests:**
```bash
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**
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
  }
]
```

---

#### 3. **GET** `/countries/:name`
Get a specific country by name.

**Example:**
```bash
GET /countries/Nigeria
```

**Response:**
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

**Error Response:**
```json
{
  "error": "Country not found"
}
```

---

#### 4. **DELETE** `/countries/:name`
Delete a country record by name.

**Example:**
```bash
DELETE /countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

**Error Response:**
```json
{
  "error": "Country not found"
}
```

---

#### 5. **GET** `/status`
Get API status with total countries and last refresh timestamp.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-26T12:00:00.000Z"
}
```

---

#### 6. **GET** `/countries/image`
Serve the generated summary image showing top 5 countries by GDP.

**Response:** PNG image file

**Error Response:**
```json
{
  "error": "Summary image not found"
}
```

---

## 🗂️ Project Structure

```
exchange-rate/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration and initialization
│   ├── controllers/
│   │   └── countryController.js # Business logic for all endpoints
│   ├── services/
│   │   ├── externalApi.js       # External API calls
│   │   └── imageGenerator.js    # Summary image generation
│   ├── routes/
│   │   └── index.js             # API routes
│   └── index.js                 # Application entry point
├── cache/                        # Generated images (auto-created)
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Example environment configuration
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🔧 Dependencies

### Production Dependencies
- **express** - Web framework
- **mysql2** - MySQL client with Promise support
- **axios** - HTTP client for external APIs
- **dotenv** - Environment variable management

**Note:** Image generation uses built-in SVG (no external dependencies required)

### Development Dependencies
- **nodemon** - Auto-restart server on file changes

## 🌐 External APIs Used

1. **RestCountries API**: `https://restcountries.com/v2/all`
   - Provides country data (name, capital, region, population, flag, currencies)

2. **Exchange Rate API**: `https://open.er-api.com/v6/latest/USD`
   - Provides real-time currency exchange rates

## 💡 Key Features

### Currency Handling
- Stores only the first currency if a country has multiple
- Handles countries with no currencies (sets values to null/0)
- Gracefully handles currencies not found in exchange rate API

### GDP Calculation
- Formula: `population × random(1000-2000) ÷ exchange_rate`
- New random multiplier generated on each refresh

### Update Logic
- Case-insensitive country name matching
- Updates existing records or inserts new ones
- Recalculates GDP on every refresh

### Error Handling
- Consistent JSON error responses
- Proper HTTP status codes (400, 404, 500, 503)
- Transaction rollback on failures

## 🧪 Testing

Test the API using curl or tools like Postman:

```bash
# Refresh data
curl -X POST http://localhost:3000/countries/refresh

# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl http://localhost:3000/countries?region=Africa

# Get specific country
curl http://localhost:3000/countries/Nigeria

# Get status
curl http://localhost:3000/status

# View summary image
curl http://localhost:3000/countries/image --output summary.png
```

## 📦 Deployment

### Environment Variables for Production
Make sure to set these in your hosting platform:
- `PORT` - Server port
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `DB_PORT` - MySQL port
- `NODE_ENV=production`

### Recommended Hosting Platforms
- Railway
- Heroku
- AWS (EC2, Elastic Beanstalk, or ECS)
- DigitalOcean App Platform
- Google Cloud Platform
- Azure App Service

### Deployment Steps (General)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Ensure MySQL database is provisioned
5. Deploy application
6. Run initial refresh: `POST /countries/refresh`

## 📝 Notes

- The database tables are automatically created on first run
- Run `POST /countries/refresh` after deployment to populate data
- Summary image is generated after each successful refresh
- The API uses connection pooling for better performance
- All timestamps are in ISO 8601 format
- **Security:** The application uses a dedicated MySQL user (not root)

## 📚 Additional Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Detailed API reference
- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to Railway, AWS, Heroku
- **[Security Best Practices](SECURITY.md)** - Security guidelines and checklist
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License

## 👤 Author

Your Name - Your Email

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.
