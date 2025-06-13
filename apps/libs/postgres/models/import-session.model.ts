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
import { PendingTransaction } from './pending-transaction.model';

@Table({
  tableName: 'import_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ImportSession extends Model<ImportSession> {
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
  filename: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  file_type: string;

  @Default(0)
  @Column(DataType.INTEGER)
  total_transactions: number;

  @Default(0)
  @Column(DataType.INTEGER)
  auto_mapped_count: number;

  @Default(0)
  @Column(DataType.INTEGER)
  manual_mapped_count: number;

  @Default('pending')
  @Column(DataType.TEXT)
  processing_status: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  agent1_completed: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  agent2_completed: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  agent3_completed: boolean;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at: Date;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  updated_at: Date;

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;

  @HasMany(() => PendingTransaction, 'import_session_id')
  pendingTransactions: PendingTransaction[];
}
