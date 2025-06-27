import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Stripe customer ID' })
  id: string;

  @ApiProperty({ description: 'Customer email' })
  email: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  name?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created: number;
}

export class PaymentMethodResponseDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Payment method type' })
  type: string;

  @ApiProperty({ description: 'Payment method card details', required: false })
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export class SubscriptionResponseDto {
  @ApiProperty({ description: 'Subscription ID' })
  id: string;

  @ApiProperty({ description: 'Subscription status' })
  status: string;

  @ApiProperty({ description: 'Current period start' })
  current_period_start: number;

  @ApiProperty({ description: 'Current period end' })
  current_period_end: number;

  @ApiProperty({ description: 'Plan details' })
  plan: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Invoice amount' })
  amount_due: number;

  @ApiProperty({ description: 'Invoice currency' })
  currency: string;

  @ApiProperty({ description: 'Invoice status' })
  status: string;

  @ApiProperty({ description: 'Invoice due date' })
  due_date: number;
}

export class RefundResponseDto {
  @ApiProperty({ description: 'Refund ID' })
  id: string;

  @ApiProperty({ description: 'Refund amount' })
  amount: number;

  @ApiProperty({ description: 'Refund currency' })
  currency: string;

  @ApiProperty({ description: 'Refund status' })
  status: string;

  @ApiProperty({ description: 'Refund reason' })
  reason: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({ description: 'Checkout session ID' })
  id: string;

  @ApiProperty({ description: 'Checkout session URL' })
  url: string;

  @ApiProperty({ description: 'Payment status' })
  payment_status: string;
}

export class SetupIntentResponseDto {
  @ApiProperty({ description: 'Setup intent ID' })
  id: string;

  @ApiProperty({ description: 'Client secret for frontend' })
  client_secret: string;

  @ApiProperty({ description: 'Setup intent status' })
  status: string;
}

export class UsageRecordResponseDto {
  @ApiProperty({ description: 'Usage record ID' })
  id: string;

  @ApiProperty({ description: 'Usage quantity' })
  quantity: number;

  @ApiProperty({ description: 'Usage timestamp' })
  timestamp: number;
}

export class CreditNoteResponseDto {
  @ApiProperty({ description: 'Credit note ID' })
  id: string;

  @ApiProperty({ description: 'Credit amount' })
  amount: number;

  @ApiProperty({ description: 'Credit currency' })
  currency: string;

  @ApiProperty({ description: 'Credit status' })
  status: string;
}

export class CustomerBalanceResponseDto {
  @ApiProperty({ description: 'Customer ID' })
  customer: string;

  @ApiProperty({ description: 'Available balance by currency' })
  available: Record<string, number>;

  @ApiProperty({ description: 'Pending balance by currency' })
  pending: Record<string, number>;
}

export class WebhookResponseDto {
  @ApiProperty({ description: 'Webhook processing status' })
  received: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error code', required: false })
  code?: string;

  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;
}
