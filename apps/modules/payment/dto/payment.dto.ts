import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsUrl,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class AttachPaymentMethodDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  paymentMethodId: string;
}

export class ListPaymentMethodsDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Subscription plan', enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Trial period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'New subscription plan', enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  newPlan: 'monthly' | 'annual';
}

export class CancelSubscriptionDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;
}

export class GetInvoicesDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class GetPaymentHistoryDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class GetSubscriptionStatusDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;
}

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Subscription plan', enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ description: 'Success URL after payment' })
  @IsUrl()
  successUrl: string;

  @ApiProperty({ description: 'Cancel URL if payment is cancelled' })
  @IsUrl()
  cancelUrl: string;
}

export class CreateCustomerPortalSessionDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Return URL for customer portal' })
  @IsUrl()
  returnUrl: string;
}

export class DetachPaymentMethodDto {
  @ApiProperty({ description: 'Payment method ID to detach' })
  @IsString()
  paymentMethodId: string;
}

export class SetDefaultPaymentMethodDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Payment method ID to set as default' })
  @IsString()
  paymentMethodId: string;
}

export class CreateSetupIntentDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiPropertyOptional({ description: 'Payment method types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethodTypes?: string[];
}

export class PauseSubscriptionDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;

  @ApiPropertyOptional({ description: 'Unix timestamp when to resume subscription' })
  @IsOptional()
  @IsNumber()
  resumeAt?: number;
}

export class UpdateSubscriptionWithProrationDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'New subscription plan', enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  newPlan: 'monthly' | 'annual';

  @ApiPropertyOptional({
    description: 'Proration behavior',
    enum: ['create_prorations', 'none', 'always_invoice'],
  })
  @IsOptional()
  @IsIn(['create_prorations', 'none', 'always_invoice'])
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export class SubscriptionItemDto {
  @ApiProperty({ description: 'Subscription plan', enum: ['monthly', 'annual'] })
  @IsIn(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Metadata for the subscription' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Trial period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;
}

export class CreateMultipleSubscriptionsDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Array of subscriptions to create', type: [SubscriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  subscriptions: SubscriptionItemDto[];
}

export class CreateUsageBasedSubscriptionDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Usage-based price ID' })
  @IsString()
  usagePriceId: string;

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Metadata for the subscription' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class RecordUsageDto {
  @ApiProperty({ description: 'Subscription item ID' })
  @IsString()
  subscriptionItemId: string;

  @ApiProperty({ description: 'Quantity of usage' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Unix timestamp for the usage' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

export class GetUsageRecordsDto {
  @ApiProperty({ description: 'Subscription item ID' })
  @IsString()
  subscriptionItemId: string;
}

export class CreateRefundDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiPropertyOptional({ description: 'Refund amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Reason for refund',
    enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
  })
  @IsOptional()
  @IsIn(['duplicate', 'fraudulent', 'requested_by_customer'])
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';

  @ApiPropertyOptional({ description: 'Metadata for the refund' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class ListRefundsDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class GetRefundDto {
  @ApiProperty({ description: 'Refund ID' })
  @IsString()
  refundId: string;
}

export class CreateCreditNoteDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsString()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'Credit amount in cents' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Reason for credit note' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Metadata for the credit note' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class ListCreditNotesDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class VoidCreditNoteDto {
  @ApiProperty({ description: 'Credit note ID' })
  @IsString()
  creditNoteId: string;
}

export class AddCustomerCreditDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;

  @ApiProperty({ description: 'Credit amount in cents' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Description for the credit' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Metadata for the credit' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class GetCustomerBalanceDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}

export class ListCustomerBalanceTransactionsDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  stripeCustomerId: string;
}
