import { Controller, Post, Body, Req, Res, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { Profile } from 'apps/libs/postgres/models/profile.model';
import { RateLimitGuard } from './guards/rate-limit.guard';
import {
  AdminOperationsRateLimit,
  DataRetrievalRateLimit,
  GeneralPaymentRateLimit,
  PaymentCreationRateLimit,
  RefundCreationRateLimit,
  SubscriptionModificationRateLimit,
  WebhookRateLimit,
} from './decorators/payment-rate-limits.decorator';
import {
  CreateCustomerDto,
  AttachPaymentMethodDto,
  ListPaymentMethodsDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  CancelSubscriptionDto,
  GetInvoicesDto,
  GetPaymentHistoryDto,
  GetSubscriptionStatusDto,
  CreateCheckoutSessionDto,
  CreateCustomerPortalSessionDto,
  DetachPaymentMethodDto,
  SetDefaultPaymentMethodDto,
  CreateSetupIntentDto,
  PauseSubscriptionDto,
  UpdateSubscriptionWithProrationDto,
  CreateMultipleSubscriptionsDto,
  CreateUsageBasedSubscriptionDto,
  RecordUsageDto,
  GetUsageRecordsDto,
  CreateRefundDto,
  ListRefundsDto,
  GetRefundDto,
  CreateCreditNoteDto,
  ListCreditNotesDto,
  VoidCreditNoteDto,
  AddCustomerCreditDto,
  GetCustomerBalanceDto,
  ListCustomerBalanceTransactionsDto,
} from './dto/payment.dto';
import {
  CustomerResponseDto,
  PaymentMethodResponseDto,
  SubscriptionResponseDto,
  CheckoutSessionResponseDto,
  WebhookResponseDto,
  ErrorResponseDto,
} from './dto/payment-response.dto';

@ApiTags('stripe')
@Controller('stripe')
@UseGuards(RateLimitGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('customer')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Create a new Stripe customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data', type: ErrorResponseDto })
  async createCustomer(@Body() body: CreateCustomerDto) {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('payment-method/attach')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Attach a payment method to a customer' })
  @ApiResponse({ status: 200, description: 'Payment method attached successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async attachPaymentMethod(@Body() body: AttachPaymentMethodDto) {
    return this.stripeService.attachPaymentMethod(body.stripeCustomerId, body.paymentMethodId);
  }

  @Post('payment-methods')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'List payment methods for a customer' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
    type: [PaymentMethodResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid customer ID', type: ErrorResponseDto })
  async listPaymentMethods(@Body() body: ListPaymentMethodsDto) {
    return this.stripeService.listPaymentMethods(body.stripeCustomerId);
  }

  @Post('subscription')
  @PaymentCreationRateLimit()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid subscription data', type: ErrorResponseDto })
  async createSubscription(@Body() body: CreateSubscriptionDto) {
    return this.stripeService.createSubscription(
      body.stripeCustomerId,
      body.plan,
      body.paymentMethodId,
      body.trialDays,
    );
  }

  @Post('subscription/update')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Update an existing subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async updateSubscription(@Body() body: UpdateSubscriptionDto) {
    return this.stripeService.updateSubscription(body.subscriptionId, body.newPlan);
  }

  @Post('subscription/cancel')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID' })
  async cancelSubscription(@Body() body: CancelSubscriptionDto) {
    return this.stripeService.cancelSubscription(body.subscriptionId);
  }

  @Post('webhook')
  @WebhookRateLimit()
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({ name: 'stripe-signature', description: 'Stripe webhook signature' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    type: WebhookResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or payload',
    type: ErrorResponseDto,
  })
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    let event;
    try {
      event = this.stripeService.constructEventFromRequest(req, sig);
      await this.stripeService.handleWebhookEvent(event);
      res.status(200).send({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  @Post('invoices')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get invoices for a customer' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async getInvoices(@Body() body: GetInvoicesDto) {
    return this.stripeService.getInvoices(body.stripeCustomerId);
  }

  @Post('payment-history')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get payment history for a customer' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async getPaymentHistory(@Body() body: GetPaymentHistoryDto) {
    return this.stripeService.getPaymentHistory(body.stripeCustomerId);
  }

  @Post('subscription/status')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get subscription status' })
  @ApiResponse({ status: 200, description: 'Subscription status retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID' })
  async getSubscriptionStatus(@Body() body: GetSubscriptionStatusDto) {
    return this.stripeService.getSubscriptionStatus(body.subscriptionId);
  }

  @Post('checkout-session')
  @PaymentCreationRateLimit()
  @ApiOperation({ summary: 'Create a checkout session' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid checkout data', type: ErrorResponseDto })
  async createCheckoutSession(@Body() body: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(
      body.stripeCustomerId,
      body.plan,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('customer-portal')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Create customer portal session' })
  @ApiResponse({ status: 201, description: 'Customer portal session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer data' })
  async createCustomerPortalSession(@Body() body: CreateCustomerPortalSessionDto) {
    return this.stripeService.createCustomerPortalSession(body.stripeCustomerId, body.returnUrl);
  }

  @Post('admin/subscriptions')
  @AdminOperationsRateLimit()
  @ApiOperation({ summary: 'List all subscriptions (Admin only)' })
  @ApiResponse({ status: 200, description: 'All subscriptions retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listAllSubscriptions() {
    // In a real app, add admin authentication/authorization here
    return Profile.findAll({
      attributes: [
        'id',
        'email',
        'stripeCustomerId',
        'stripeSubscriptionId',
        'subscriptionStatus',
        'currentPlan',
        'planRenewalDate',
      ],
    });
  }

  @Post('payment-method/detach')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Detach a payment method from customer' })
  @ApiResponse({ status: 200, description: 'Payment method detached successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment method ID' })
  async detachPaymentMethod(@Body() body: DetachPaymentMethodDto) {
    return this.stripeService.detachPaymentMethod(body.paymentMethodId);
  }

  @Post('payment-method/set-default')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Set default payment method for customer' })
  @ApiResponse({ status: 200, description: 'Default payment method set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer or payment method ID' })
  async setDefaultPaymentMethod(@Body() body: SetDefaultPaymentMethodDto) {
    return this.stripeService.setDefaultPaymentMethod(body.stripeCustomerId, body.paymentMethodId);
  }

  @Post('setup-intent')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Create setup intent for future payments' })
  @ApiResponse({ status: 201, description: 'Setup intent created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid setup intent data' })
  async createSetupIntent(@Body() body: CreateSetupIntentDto) {
    return this.stripeService.createSetupIntent(body.stripeCustomerId, body.paymentMethodTypes);
  }

  @Post('payment-methods/all')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'List all payment methods for customer' })
  @ApiResponse({ status: 200, description: 'All payment methods retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async listAllPaymentMethods(@Body() body: ListPaymentMethodsDto) {
    return this.stripeService.listAllPaymentMethods(body.stripeCustomerId);
  }

  @Post('subscription/cancel-immediately')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Cancel subscription immediately' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled immediately' })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID' })
  async cancelSubscriptionImmediately(@Body() body: CancelSubscriptionDto) {
    return this.stripeService.cancelSubscriptionImmediately(body.subscriptionId);
  }

  @Post('subscription/pause')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Pause a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription paused successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async pauseSubscription(@Body() body: PauseSubscriptionDto) {
    return this.stripeService.pauseSubscription(body.subscriptionId, body.resumeAt);
  }

  @Post('subscription/resume')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Resume a paused subscription' })
  @ApiResponse({ status: 200, description: 'Subscription resumed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription ID' })
  async resumeSubscription(@Body() body: CancelSubscriptionDto) {
    return this.stripeService.resumeSubscription(body.subscriptionId);
  }

  @Post('subscription/update-with-proration')
  @SubscriptionModificationRateLimit()
  @ApiOperation({ summary: 'Update subscription with proration options' })
  @ApiResponse({ status: 200, description: 'Subscription updated with proration' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async updateSubscriptionWithProration(@Body() body: UpdateSubscriptionWithProrationDto) {
    return this.stripeService.updateSubscriptionWithProration(
      body.subscriptionId,
      body.newPlan,
      body.prorationBehavior,
    );
  }

  @Post('subscription/create-multiple')
  @PaymentCreationRateLimit()
  @ApiOperation({ summary: 'Create multiple subscriptions for a customer' })
  @ApiResponse({ status: 201, description: 'Multiple subscriptions created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription data' })
  async createMultipleSubscriptions(@Body() body: CreateMultipleSubscriptionsDto) {
    return this.stripeService.createMultipleSubscriptions(
      body.stripeCustomerId,
      body.subscriptions,
    );
  }

  @Post('subscription/usage-based')
  @PaymentCreationRateLimit()
  @ApiOperation({ summary: 'Create usage-based subscription' })
  @ApiResponse({ status: 201, description: 'Usage-based subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid usage subscription data' })
  async createUsageBasedSubscription(@Body() body: CreateUsageBasedSubscriptionDto) {
    return this.stripeService.createUsageBasedSubscription(
      body.stripeCustomerId,
      body.usagePriceId,
      body.paymentMethodId,
      body.metadata,
    );
  }

  @Post('usage/record')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Record usage for usage-based subscription' })
  @ApiResponse({ status: 200, description: 'Usage recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid usage data' })
  async recordUsage(@Body() body: RecordUsageDto) {
    return this.stripeService.recordUsage(body.subscriptionItemId, body.quantity, body.timestamp);
  }

  @Post('usage/records')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get usage records for subscription item' })
  @ApiResponse({ status: 200, description: 'Usage records retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid subscription item ID' })
  async getUsageRecords(@Body() body: GetUsageRecordsDto) {
    return this.stripeService.getUsageRecords(body.subscriptionItemId);
  }

  @Post('refund/create')
  @RefundCreationRateLimit()
  @ApiOperation({ summary: 'Create a refund for a payment' })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund data' })
  async createRefund(@Body() body: CreateRefundDto) {
    return this.stripeService.createRefund(
      body.paymentIntentId,
      body.amount,
      body.reason,
      body.metadata,
    );
  }

  @Post('refund/list')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'List refunds for a customer' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async listRefunds(@Body() body: ListRefundsDto) {
    return this.stripeService.listRefunds(body.stripeCustomerId);
  }

  @Post('refund/get')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get specific refund details' })
  @ApiResponse({ status: 200, description: 'Refund details retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refund ID' })
  async getRefund(@Body() body: GetRefundDto) {
    return this.stripeService.getRefund(body.refundId);
  }

  @Post('credit-note/create')
  @RefundCreationRateLimit()
  @ApiOperation({ summary: 'Create a credit note for an invoice' })
  @ApiResponse({ status: 201, description: 'Credit note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credit note data' })
  async createCreditNote(@Body() body: CreateCreditNoteDto) {
    return this.stripeService.createCreditNote(
      body.invoiceId,
      body.amount,
      body.reason,
      body.metadata,
    );
  }

  @Post('credit-note/list')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'List credit notes for a customer' })
  @ApiResponse({ status: 200, description: 'Credit notes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async listCreditNotes(@Body() body: ListCreditNotesDto) {
    return this.stripeService.listCreditNotes(body.stripeCustomerId);
  }

  @Post('credit-note/void')
  @RefundCreationRateLimit()
  @ApiOperation({ summary: 'Void a credit note' })
  @ApiResponse({ status: 200, description: 'Credit note voided successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credit note ID' })
  async voidCreditNote(@Body() body: VoidCreditNoteDto) {
    return this.stripeService.voidCreditNote(body.creditNoteId);
  }

  @Post('customer/add-credit')
  @GeneralPaymentRateLimit()
  @ApiOperation({ summary: 'Add credit to customer account' })
  @ApiResponse({ status: 200, description: 'Credit added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credit data' })
  async addCustomerCredit(@Body() body: AddCustomerCreditDto) {
    return this.stripeService.addCustomerCredit(
      body.stripeCustomerId,
      body.amount,
      body.description,
      body.metadata,
    );
  }

  @Post('customer/balance')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'Get customer account balance' })
  @ApiResponse({ status: 200, description: 'Customer balance retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async getCustomerBalance(@Body() body: GetCustomerBalanceDto) {
    return this.stripeService.getCustomerBalance(body.stripeCustomerId);
  }

  @Post('customer/balance-transactions')
  @DataRetrievalRateLimit()
  @ApiOperation({ summary: 'List customer balance transactions' })
  @ApiResponse({ status: 200, description: 'Balance transactions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer ID' })
  async listCustomerBalanceTransactions(@Body() body: ListCustomerBalanceTransactionsDto) {
    return this.stripeService.listCustomerBalanceTransactions(body.stripeCustomerId);
  }
}
