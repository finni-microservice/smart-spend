import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { Profile } from './models/profile.model';
import { Category } from './models/category.model';
import { Transaction } from './models/transaction.model';
import { ExtractedTransaction } from './models/extracted-transaction.model';
import { ImportSession } from './models/import-session.model';
import { PendingTransaction } from './models/pending-transaction.model';
import { TransactionMappingPattern } from './models/transaction-mapping-pattern.model';
import { UserOnboarding } from './models/user-onboarding.model';

export const postgresDatabaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async (configService: ConfigService) => {
      const nodeEnv = configService.get('NODE_ENV');
      const isDev = ['development', 'local'].includes(nodeEnv);

      try {
        const sequelize = new Sequelize({
          dialect: 'postgres',
          host: configService.get('POSTGRES_DB_HOST') || 'localhost',
          port: +configService.get<number>('POSTGRES_DB_PORT') || 5432,
          username: configService.get('POSTGRES_DB_USERNAME') || 'postgres',
          password: configService.get('POSTGRES_DB_PASSWORD') || 'password',
          database: configService.get('POSTGRES_DB_NAME') || 'spend_smart_db',
          logging: isDev ? console.log : false,
          dialectOptions: {
            ssl:
              nodeEnv === 'production'
                ? {
                    require: true,
                    rejectUnauthorized: false,
                  }
                : false,
          },
        });

        // Add all models to Sequelize
        sequelize.addModels([
          Profile,
          Category,
          Transaction,
          ExtractedTransaction,
          ImportSession,
          PendingTransaction,
          TransactionMappingPattern,
          UserOnboarding,
        ]);

        // Try to connect - if it fails in development, log and continue
        try {
          await sequelize.authenticate();
          console.log('✅ PostgreSQL connection established successfully');

          // Only sync in development if connection works
          if (isDev) {
            await sequelize.sync();
            console.log('✅ Database models synchronized');
          }
        } catch (connectionError) {
          if (isDev) {
            console.warn(
              '⚠️  PostgreSQL connection failed in development mode - continuing without database',
            );
            console.warn(
              '   To fix: Set up PostgreSQL or update database credentials in .env.local',
            );
            console.warn('   Error:', connectionError.message);

            // Return a mock sequelize instance for development
            return {
              authenticate: () => Promise.resolve(),
              sync: () => Promise.resolve(),
              close: () => Promise.resolve(),
              addModels: () => {},
              models: {},
            };
          } else {
            // In production, throw the error
            throw connectionError;
          }
        }

        return sequelize;
      } catch (error) {
        if (isDev) {
          console.warn(
            '⚠️  Failed to initialize PostgreSQL in development mode - continuing without database',
          );
          console.warn('   Error:', error.message);

          // Return a mock sequelize instance for development
          return {
            authenticate: () => Promise.resolve(),
            sync: () => Promise.resolve(),
            close: () => Promise.resolve(),
            addModels: () => {},
            models: {},
          };
        } else {
          throw error;
        }
      }
    },
    inject: [ConfigService],
  },
];
