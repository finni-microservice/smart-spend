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
} from 'sequelize-typescript';
import { Profile } from './profile.model';
import { ImportSession } from './import-session.model';
import { Category } from './category.model';

@Table({
  tableName: 'pending_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class PendingTransaction extends Model<PendingTransaction> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @ForeignKey(() => ImportSession)
  @Column(DataType.UUID)
  import_session_id: string;

  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column(DataType.UUID)
  user_id: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  amount: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  normalized_description: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  date: Date;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('income', 'expense'),
    validate: {
      isIn: [['income', 'expense']],
    },
  })
  type: 'income' | 'expense';

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  suggested_category_id: string;

  @Column(DataType.JSONB)
  raw_data: object;

  @Default(0.0)
  @Column(DataType.DECIMAL)
  confidence_score: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_auto_mapped: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  requires_manual_review: boolean;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => ImportSession, 'import_session_id')
  importSession: ImportSession;

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;

  @BelongsTo(() => Category, 'suggested_category_id')
  suggestedCategory: Category;
}
