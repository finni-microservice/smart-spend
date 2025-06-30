# Spend Smart API

A robust backend API for the Spend Smart application, built with NestJS and MongoDB.

## 🚀 Features

- **Modern Tech Stack**: Built with NestJS, MongoDB, and TypeScript
- **Advanced Logging**: Integrated with Axiom for centralized logging
- **Environment Configuration**: Flexible environment-based configuration
- **Code Quality**: ESLint and Prettier for code formatting
- **Git Hooks**: Husky for pre-commit hooks
- **Type Safety**: Full TypeScript support
- **API Documentation**: (Coming soon)

## 📋 Prerequisites

- Node.js >= 18
- MongoDB
- PNPM package manager
- Axiom account (for logging)

## 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MicroFinanace/Smart-Spend-backend-.git
   cd spend-smart
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create environment files:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=your_mongodb_uri
   MONGO_DB_NAME=your_db_name
   AXIOM_TOKEN=your_axiom_token
   AXIOM_DATASET=your_axiom_dataset
   ```

## 🚀 Running the App

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 📁 Project Structure

```
spend-smart/
├── apps/
│   ├── config/         # Configuration files
│   ├── factories/      # Factory providers
│   ├── src/           # Source code
│   └── utils/         # Utility functions
├── test/              # Test files
└── package.json
```

## 🔧 Configuration

The application uses different environment files based on the NODE_ENV:

- `.env.local` - Local development
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.staging` - Staging environment

## 📝 Code Style

The project uses ESLint and Prettier for code formatting. Run the following commands to check and fix code style:

```bash
# Lint check
pnpm lint

# Format code
pnpm format
```

## 🔐 Environment Variables

Required environment variables:

- `NODE_ENV`: Environment (development/production/staging/local)
- `PORT`: Server port
- `MONGO_URI`: MongoDB connection URI
- `MONGO_DB_NAME`: MongoDB database name
- `AXIOM_TOKEN`: Axiom API token
- `AXIOM_DATASET`: Axiom dataset name

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and unlicensed.

## 👥 Authors

- **Farshid** - _Initial work_

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- MongoDB for the database
- Axiom for logging infrastructure

# smart-spend

# smart-spend
