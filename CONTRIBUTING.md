# Contributing to Country Exchange Rate API

Thank you for considering contributing to this project! Here are some guidelines to help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/exchange-rate.git
   cd exchange-rate
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` from `.env.example` and configure your database
5. Start development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use ES6+ features
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

## Testing

Before submitting a PR:
1. Test all endpoints manually
2. Run the test script: `./test-api.sh`
3. Check for errors in console
4. Verify database changes

## Submitting Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Commit with clear messages:
   ```bash
   git commit -m "Add: feature description"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a Pull Request

## Commit Message Guidelines

- **Add:** New feature
- **Fix:** Bug fix
- **Update:** Modify existing feature
- **Remove:** Delete code/feature
- **Refactor:** Code restructuring
- **Docs:** Documentation changes

## Pull Request Process

1. Update README.md if needed
2. Test your changes thoroughly
3. Describe what your PR does
4. Link any related issues

## Reporting Bugs

Include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)
- Error messages/logs

## Feature Requests

- Describe the feature
- Explain why it's useful
- Provide examples if possible

## Questions?

Create an issue with the "question" label.

Thank you for contributing! 🎉
