import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { Transaction } from './transaction.model';
import { ExtractedTransaction } from './extracted-transaction.model';
import { ImportSession } from './import-session.model';
import { PendingTransaction } from './pending-transaction.model';
import { TransactionMappingPattern } from './transaction-mapping-pattern.model';
import { UserOnboarding } from './user-onboarding.model';

@Table({
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Profile extends Model<Profile> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  email: string;

  @Column(DataType.TEXT)
  avatar_url: string;

  @AllowNull(false)
  @Default('USD')
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at: Date;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  updated_at: Date;

  @Column(DataType.STRING)
  stripeCustomerId: string;

  @Column(DataType.STRING)
  stripeSubscriptionId: string;

  @Column(DataType.STRING)
  subscriptionStatus: string;

  @Column(DataType.STRING)
  currentPlan: string; // freemium, core, pro

  @Column(DataType.DATE)
  planRenewalDate: Date;

  @HasMany(() => Category, 'user_id')
  categories: Category[];

  @HasMany(() => Transaction, 'user_id')
  transactions: Transaction[];

  @HasMany(() => ExtractedTransaction, 'user_id')
  extractedTransactions: ExtractedTransaction[];

  @HasMany(() => ImportSession, 'user_id')
  importSessions: ImportSession[];

  @HasMany(() => PendingTransaction, 'user_id')
  pendingTransactions: PendingTransaction[];

  @HasMany(() => TransactionMappingPattern, 'user_id')
  mappingPatterns: TransactionMappingPattern[];

  @HasMany(() => UserOnboarding, 'user_id')
  onboarding: UserOnboarding[];
}
