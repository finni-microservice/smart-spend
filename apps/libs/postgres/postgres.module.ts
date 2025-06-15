import { Module } from '@nestjs/common';
import { postgresDatabaseProviders } from './postgres.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [...postgresDatabaseProviders],
  exports: [...postgresDatabaseProviders],
})
export class PostgresqlModule {}
