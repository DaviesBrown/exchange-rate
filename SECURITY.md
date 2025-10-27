# Security Best Practices

## Database Security

### ✅ DO

1. **Use Dedicated Database User**
   ```sql
   -- Create a user specifically for the application
   CREATE USER 'exchange_api_user'@'localhost' IDENTIFIED BY 'strong_password';
   
   -- Grant only necessary privileges
   GRANT SELECT, INSERT, UPDATE, DELETE ON exchange_rate_db.* TO 'exchange_api_user'@'localhost';
   ```

2. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Use a password generator
   - Example: `K#9mP$xL2@vN4wQ!`

3. **Limit Database Access**
   - Use `'user'@'localhost'` for local connections
   - Use `'user'@'specific.ip.address'` for remote connections
   - Avoid `'user'@'%'` (allows from anywhere)

4. **Regular Privilege Reviews**
   ```sql
   -- Check user privileges
   SHOW GRANTS FOR 'exchange_api_user'@'localhost';
   ```

### ❌ DON'T

1. **Never Use Root User**
   - Root has unrestricted access
   - Compromise = full database control
   - Always create dedicated users

2. **Never Hardcode Credentials**
   ```javascript
   // ❌ BAD
   const password = 'mypassword123';
   
   // ✅ GOOD
   const password = process.env.DB_PASSWORD;
   ```

3. **Never Commit .env File**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

## Application Security

### Environment Variables

1. **Use Different Credentials per Environment**
   ```
   Development:  exchange_api_dev@localhost
   Staging:      exchange_api_stage@localhost
   Production:   exchange_api_prod@specific-ip
   ```

2. **Rotate Credentials Regularly**
   - Change passwords quarterly
   - Update after team member departure
   - Use password management tools

### API Security

1. **Add Rate Limiting (Future Enhancement)**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/countries/refresh', limiter);
   ```

2. **Add Request Validation**
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   app.post('/countries',
     body('name').notEmpty(),
     body('population').isNumeric(),
     (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
       }
       // Process request
     }
   );
   ```

3. **Implement CORS Properly**
   ```javascript
   const cors = require('cors');
   
   // In production, specify allowed origins
   app.use(cors({
     origin: ['https://yourfrontend.com'],
     methods: ['GET', 'POST', 'DELETE'],
     credentials: true
   }));
   ```

4. **Use HTTPS in Production**
   - Never send credentials over HTTP
   - Use SSL/TLS certificates
   - Railway, Heroku provide HTTPS by default

### SQL Injection Prevention

✅ **Already Implemented** - Using parameterized queries:

```javascript
// ✅ SAFE - Parameterized query
await pool.query(
  'SELECT * FROM countries WHERE name = ?',
  [name]
);

// ❌ UNSAFE - String concatenation
await pool.query(
  `SELECT * FROM countries WHERE name = '${name}'`
);
```

## Deployment Security

### 1. Environment Variables

**Railway:**
```bash
# Set via Railway dashboard or CLI
railway variables set DB_PASSWORD=secure_password
```

**Heroku:**
```bash
heroku config:set DB_PASSWORD=secure_password
```

**AWS:**
```bash
# Use AWS Secrets Manager or Parameter Store
aws ssm put-parameter \
  --name /app/db/password \
  --value "secure_password" \
  --type SecureString
```

### 2. Network Security

1. **Firewall Rules**
   ```bash
   # Allow only necessary ports
   ufw allow 3000/tcp  # Application
   ufw allow 3306/tcp from your.ip.address  # MySQL (restricted)
   ```

2. **Private Networks**
   - Use internal networking for database connections
   - Railway: automatic private networking
   - AWS: Use VPC and security groups

### 3. Monitoring & Logging

1. **Log Security Events**
   ```javascript
   // Log failed login attempts
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
     next();
   });
   ```

2. **Monitor Database Connections**
   ```sql
   -- Show active connections
   SHOW PROCESSLIST;
   
   -- Show failed login attempts
   SELECT * FROM mysql.general_log WHERE argument LIKE '%Access denied%';
   ```

## Data Security

### 1. Backup Strategy

```bash
# Regular backups
mysqldump -u exchange_api_user -p exchange_rate_db > backup_$(date +%Y%m%d).sql

# Restore if needed
mysql -u exchange_api_user -p exchange_rate_db < backup_20251026.sql
```

### 2. Data Validation

Always validate and sanitize input:

```javascript
function sanitizeCountryName(name) {
  // Remove potentially harmful characters
  return name.replace(/[<>\"']/g, '');
}
```

## Dependency Security

### 1. Keep Dependencies Updated

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Update specific package
npm update package-name
```

### 2. Review Dependencies

- Check package reputation
- Review package permissions
- Use `npm ci` in production (uses package-lock.json)
- Enable GitHub Dependabot alerts

## Compliance Checklist

- [ ] Database uses dedicated user (not root)
- [ ] Strong passwords (12+ characters)
- [ ] .env not in version control
- [ ] Different credentials per environment
- [ ] HTTPS in production
- [ ] SQL parameterized queries used
- [ ] Regular backups configured
- [ ] Dependencies audited
- [ ] Error messages don't leak sensitive info
- [ ] Logging implemented
- [ ] Monitoring set up

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MySQL Security Best Practices](https://dev.mysql.com/doc/refman/8.0/en/security-guidelines.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Incident Response

If you suspect a security breach:

1. **Immediately** change all passwords
2. Review access logs
3. Check for unauthorized data access
4. Update affected users
5. Apply security patches
6. Document the incident
7. Review and improve security measures

## Contact

For security concerns, create a private security advisory in GitHub rather than a public issue.
