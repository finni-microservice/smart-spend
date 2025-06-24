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
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: configService.get('POSTGRES_DB_HOST'),
        port: +configService.get<number>('POSTGRES_DB_PORT'),
        username: configService.get('POSTGRES_DB_USERNAME'),
        password: configService.get('POSTGRES_DB_PASSWORD'),
        database: configService.get('POSTGRES_DB_NAME'),
        logging: configService.get('NODE_ENV') === 'development' ? console.log : false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
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

      await sequelize.sync();
      return sequelize;
    },
    inject: [ConfigService],
  },
];
