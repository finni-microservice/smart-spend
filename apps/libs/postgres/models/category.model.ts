import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Profile } from './profile.model';
import { Transaction } from './transaction.model';
import { PendingTransaction } from './pending-transaction.model';
import { ExtractedTransaction } from './extracted-transaction.model';
import { TransactionMappingPattern } from './transaction-mapping-pattern.model';

@Table({
  tableName: 'categories',
  timestamps: false,
})
export class Category extends Model<Category> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column(DataType.UUID)
  user_id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  emoji: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  color: string;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL)
  spent: number;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.DECIMAL)
  budget: number;

  @Default('want')
  @Column({
    type: DataType.ENUM('want', 'need'),
    validate: {
      isIn: [['want', 'need']],
    },
  })
  type: 'want' | 'need';

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;

  @HasMany(() => Transaction, 'category_id')
  transactions: Transaction[];

  @HasMany(() => PendingTransaction, 'suggested_category_id')
  pendingTransactions: PendingTransaction[];

  @HasMany(() => ExtractedTransaction, 'suggested_category_id')
  extractedTransactions: ExtractedTransaction[];

  @HasMany(() => TransactionMappingPattern, 'category_id')
  mappingPatterns: TransactionMappingPattern[];
}
