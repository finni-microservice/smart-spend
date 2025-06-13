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
  tableName: 'extracted_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class ExtractedTransaction extends Model<ExtractedTransaction> {
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
  raw_content: string;

  @Column(DataType.DECIMAL)
  extracted_amount: number;

  @Column(DataType.TEXT)
  extracted_description: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  suggested_category_id: string;

  @Column({
    type: DataType.DECIMAL,
    validate: {
      min: 0,
      max: 1,
    },
  })
  confidence_score: number;

  @Column(DataType.DATE)
  processed_at: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  is_processed: boolean;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;

  @BelongsTo(() => Category, 'suggested_category_id')
  suggestedCategory: Category;
}
