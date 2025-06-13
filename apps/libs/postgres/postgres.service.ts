import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

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

      // Don't add models here - they will be added by individual modules
      await sequelize.sync();
      return sequelize;
    },
    inject: [ConfigService],
  },
];
