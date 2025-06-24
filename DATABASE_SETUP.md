# Database Setup Guide

## PostgreSQL Configuration

This application uses both MongoDB and PostgreSQL:

- **MongoDB**: For general application data
- **PostgreSQL**: For user profiles, subscription data, and Stripe integration

### Required Environment Variables

Add these to your `.env.development` or `.env.local` file:

```bash
# PostgreSQL Configuration
POSTGRES_DB_HOST=localhost
POSTGRES_DB_PORT=5432
POSTGRES_DB_USERNAME=your_postgres_username
POSTGRES_DB_PASSWORD=your_postgres_password
POSTGRES_DB_NAME=spend_smart_db

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Database Models

The PostgreSQL database includes these models:

- `Profile` - User profiles with Stripe customer information
- `Category` - Expense categories
- `Transaction` - Financial transactions
- `ExtractedTransaction` - AI-extracted transaction data
- `ImportSession` - Data import sessions
- `PendingTransaction` - Transactions awaiting processing
- `TransactionMappingPattern` - Pattern matching for categorization
- `UserOnboarding` - User onboarding progress

### Setting up PostgreSQL

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:

   ```sql
   CREATE DATABASE spend_smart_db;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE spend_smart_db TO your_username;
   ```

3. **Update Environment Variables** with your database credentials

4. **Run the Application** - Sequelize will automatically create tables on startup

### Stripe Integration

The Profile model includes Stripe-specific fields:

- `stripeCustomerId` - Links to Stripe customer
- `stripeSubscriptionId` - Links to Stripe subscription
- `subscriptionStatus` - Current subscription status
- `currentPlan` - Current plan: 'freemium', 'monthly', or 'annual'
- `planRenewalDate` - When the plan renews

### Production Considerations

For production, make sure to:

- Use SSL connections (already configured in `dialectOptions`)
- Use environment-specific credentials
- Set up proper database backups
- Monitor database performance
