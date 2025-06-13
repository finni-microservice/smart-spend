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
  tableName: 'transactions',
  timestamps: false,
})
export class Transaction extends Model<Transaction> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column(DataType.UUID)
  user_id: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  amount: number;

  @Column(DataType.TEXT)
  description: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  category_id: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('income', 'expense'),
    validate: {
      isIn: [['income', 'expense']],
    },
  })
  type: 'income' | 'expense';

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  date: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  recurring: boolean;

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;

  @BelongsTo(() => Category, 'category_id')
  category: Category;
}
