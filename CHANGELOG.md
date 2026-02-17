# Changelog

All notable changes to the CryptoGate API are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-28

### Added

#### Core Features

- Initial release of CryptoGate REST API
- Merchant management system with signup/login
- Payment request creation and status tracking
- Support for multiple cryptocurrencies (USDT TRC20, BNB BSC, Ethereum, Bitcoin)
- API key-based authentication for payment endpoints
- JWT token-based authentication for merchant dashboard
- Webhook system with automatic retry logic
- HMAC-SHA256 signature verification for webhooks

#### API Endpoints

- `POST /api/merchants/signup` - Create new merchant account
- `POST /api/merchants/login` - Merchant authentication
- `GET /api/merchants/profile` - Get merchant profile
- `PUT /api/merchants/profile` - Update merchant details
- `POST /api/merchants/api-keys` - Generate new API key
- `POST /api/payments` - Create payment request
- `GET /api/payments` - List merchant payments
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/webhooks/verify` - Verify webhook signature
- `POST /api/payments/webhooks/test` - Generate test webhook
- `GET /api/health` - Health check endpoint

#### Security Features

- PBKDF2 password hashing
- JWT token authentication
- API key generation and validation
- Rate limiting support
- CORS protection
- Input validation with Zod
- Secure webhook signature verification

#### Payment Integrations

- USDT TRC20 (Tron network) placeholder
- Binance Pay placeholder
- Extensible architecture for additional chains

#### Documentation

- Comprehensive README with quick start guide
- API endpoint documentation
- Authentication guide
- Webhook implementation guide
- Integration examples (Node.js, React)
- Environment configuration guide

#### Testing

- Unit tests for utility functions
- Integration tests for API endpoints
- Webhook signature verification tests
- Test coverage configuration

#### DevOps

- GitHub Actions CI/CD workflow
- TypeScript validation
- Build and test automation
- Production-ready Docker configuration

#### Frontend

- Modern landing page with features showcase
- Merchant signup page
- Merchant login page
- Navigation header
- Responsive design for all screen sizes
- Beautiful UI components

#### Development

- Full-stack development environment
- Hot reload for frontend and backend
- Development logging
- Error handling middleware
- Health check endpoint

### Technical Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Backend Framework**: Express.js
- **Frontend Framework**: React 18
- **Package Manager**: pnpm
- **Build Tool**: Vite
- **Testing**: Vitest
- **Styling**: Tailwind CSS 3
- **Validation**: Zod

### Known Limitations

- Uses in-memory database (suitable for dev/testing)
- Binance Pay and USDT TRC20 are placeholder implementations
- Webhook delivery is synchronous (should use queue in production)

### Future Roadmap

- [ ] MongoDB integration for persistence
- [ ] Real Binance Pay API integration
- [ ] Real Tron blockchain integration
- [ ] Webhook delivery queue (Bull/RabbitMQ)
- [ ] Dashboard analytics
- [ ] Rate limiting with Redis
- [ ] Multi-signature wallet support
- [ ] Stablecoin support (USDC, DAI, etc.)
- [ ] Mobile app
- [ ] Advanced merchant settings
- [ ] Payment settlement automation

---

## Versioning Notes

- **0.x.x**: Pre-release versions
- **1.0.0**: First stable release
- Use semver: MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes
  - MINOR: New features (backward compatible)
  - PATCH: Bug fixes (backward compatible)

---

## How to Release

1. Update version in package.json
2. Update this CHANGELOG.md
3. Commit: `git commit -am "Release v1.x.x"`
4. Tag: `git tag v1.x.x`
5. Push: `git push --tags`
6. Create GitHub release from tag
7. Deploy to production

---

## Support

For issues, feature requests, or questions:

- GitHub Issues: https://github.com/cryptogate/api
- Email: support@cryptogate.io
- Documentation: https://docs.cryptogate.io
