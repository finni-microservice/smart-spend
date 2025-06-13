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
import { Category } from './category.model';

@Table({
  tableName: 'transaction_mapping_patterns',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TransactionMappingPattern extends Model<TransactionMappingPattern> {
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
  original_description: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  normalized_description: string;

  @AllowNull(false)
  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  category_id: string;

  @Default(1.0)
  @Column(DataType.DECIMAL)
  confidence_score: number;

  @Default(1)
  @Column(DataType.INTEGER)
  match_count: number;

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

  @BelongsTo(() => Category, 'category_id')
  category: Category;
}
