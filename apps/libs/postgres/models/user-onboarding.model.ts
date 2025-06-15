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
  Unique,
} from 'sequelize-typescript';
import { Profile } from './profile.model';

@Table({
  tableName: 'user_onboarding',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
})
export class UserOnboarding extends Model<UserOnboarding> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Unique
  @ForeignKey(() => Profile)
  @Column(DataType.UUID)
  user_id: string;

  @Column(DataType.JSONB)
  onboarding_data: object;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  completed_at: Date;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => Profile, 'user_id')
  user: Profile;
}
