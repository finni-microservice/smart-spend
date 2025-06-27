import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Profile } from 'apps/libs/postgres/models/profile.model';
import { Logger } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger('StripeService');
  private readonly priceIds: {
    freemium: null;
    monthly: string;
    annual: string;
  };

  constructor(private configService: ConfigService) {
    const stripeConfig = this.configService.get('env.stripe');

    if (!stripeConfig) {
      throw new Error(
        'Stripe configuration not found. Please ensure STRIPE_* environment variables are set and env.config.ts is properly loaded.',
      );
    }

    if (!stripeConfig.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required but not found in environment variables.');
    }

    this.stripe = new Stripe(stripeConfig.secretKey);

    this.priceIds = {
      freemium: null, // No price for free tier
      monthly: stripeConfig.monthlyPriceId, // $5/month
      annual: stripeConfig.annualPriceId, // $48/year ($4/month)
    };

    this.logger.log('StripeService initialized successfully', 'StripeService');
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createSubscription(
    stripeCustomerId: string,
    plan: 'monthly' | 'annual',
    paymentMethodId: string,
    trialDays?: number,
  ): Promise<Stripe.Subscription> {
    const priceId = this.priceIds[plan];
    if (!priceId) throw new Error('Invalid or missing price ID for plan');

    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create subscription
    return this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(
    stripeCustomerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
  }

  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(
    stripeCustomerId: string,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return this.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });
  }

  /**
   * Remove/detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Set a payment method as the default for a customer
   */
  async setDefaultPaymentMethod(
    stripeCustomerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  /**
   * Create a setup intent for adding payment methods (supports cards, bank accounts, wallets)
   */
  async createSetupIntent(
    stripeCustomerId: string,
    paymentMethodTypes: string[] = ['card'],
  ): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: paymentMethodTypes,
      usage: 'off_session',
    });
  }

  /**
   * List all payment methods including non-card types
   */
  async listAllPaymentMethods(stripeCustomerId: string): Promise<{
    cards: Stripe.ApiList<Stripe.PaymentMethod>;
    bankAccounts: Stripe.ApiList<Stripe.PaymentMethod>;
    wallets: Stripe.ApiList<Stripe.PaymentMethod>;
  }> {
    const [cards, bankAccounts, wallets] = await Promise.all([
      this.stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card' }),
      this.stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'us_bank_account' }),
      this.stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'link' }),
    ]);

    return { cards, bankAccounts, wallets };
  }

  async updateSubscription(subscriptionId: string, newPlan: 'monthly' | 'annual') {
    const priceId = this.priceIds[newPlan];
    if (!priceId) throw new Error('Invalid or missing price ID for plan');

    // First, retrieve the subscription to get the current subscription item ID
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const currentSubscriptionItemId = subscription.items.data[0].id;

    // Update the existing subscription item with the new price
    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentSubscriptionItemId,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  }

  /**
   * Cancel subscription immediately
   */
  async cancelSubscriptionImmediately(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId: string, resumeAt?: number): Promise<Stripe.Subscription> {
    const pauseCollection = resumeAt
      ? { behavior: 'void', resumes_at: resumeAt }
      : { behavior: 'void' };

    return this.stripe.subscriptions.update(subscriptionId, {
      pause_collection: pauseCollection as any,
    });
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    });
  }

  /**
   * Update subscription with proration handling
   */
  async updateSubscriptionWithProration(
    subscriptionId: string,
    newPlan: 'monthly' | 'annual',
    prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations',
  ): Promise<Stripe.Subscription> {
    const priceId = this.priceIds[newPlan];
    if (!priceId) throw new Error('Invalid or missing price ID for plan');

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const currentSubscriptionItemId = subscription.items.data[0].id;

    return this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentSubscriptionItemId,
          price: priceId,
        },
      ],
      proration_behavior: prorationBehavior,
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Create multiple subscriptions for a customer
   */
  async createMultipleSubscriptions(
    stripeCustomerId: string,
    subscriptions: Array<{
      plan: 'monthly' | 'annual';
      paymentMethodId: string;
      metadata?: Record<string, string>;
      trialDays?: number;
    }>,
  ): Promise<Stripe.Subscription[]> {
    const results = await Promise.all(
      subscriptions.map(async sub => {
        const priceId = this.priceIds[sub.plan];
        if (!priceId) throw new Error(`Invalid price ID for plan: ${sub.plan}`);

        // Attach payment method if not already attached
        await this.stripe.paymentMethods.attach(sub.paymentMethodId, {
          customer: stripeCustomerId,
        });

        return this.stripe.subscriptions.create({
          customer: stripeCustomerId,
          items: [{ price: priceId }],
          trial_period_days: sub.trialDays,
          metadata: sub.metadata || {},
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
        });
      }),
    );

    return results;
  }

  /**
   * Create usage-based subscription
   */
  async createUsageBasedSubscription(
    stripeCustomerId: string,
    usagePriceId: string,
    paymentMethodId: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Subscription> {
    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: usagePriceId }],
      metadata: metadata || {},
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  /**
   * Record usage for a subscription item
   */
  async recordUsage(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number,
  ): Promise<any> {
    // Note: Usage records are created via subscription items
    const usageRecord = await fetch(
      `https://api.stripe.com/v1/subscription_items/${subscriptionItemId}/usage_records`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.get('env.stripe.secretKey')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          quantity: quantity.toString(),
          timestamp: (timestamp || Math.floor(Date.now() / 1000)).toString(),
        }),
      },
    );

    return usageRecord.json();
  }

  /**
   * Get usage records for a subscription item
   */
  async getUsageRecords(subscriptionItemId: string): Promise<any> {
    const response = await fetch(
      `https://api.stripe.com/v1/subscription_items/${subscriptionItemId}/usage_record_summaries`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.configService.get('env.stripe.secretKey')}`,
        },
      },
    );

    return response.json();
  }

  /**
   * Process a refund for a payment
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
    metadata?: Record<string, string>,
  ): Promise<Stripe.Refund> {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason,
      metadata,
    };

    if (amount) {
      refundParams.amount = amount; // Amount in cents
    }

    return this.stripe.refunds.create(refundParams);
  }

  /**
   * List refunds for a customer
   */
  async listRefunds(stripeCustomerId: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    // Get all charges for the customer first
    const charges = await this.stripe.charges.list({ customer: stripeCustomerId });
    const chargeIds = charges.data.map(charge => charge.id);

    if (chargeIds.length === 0) {
      return {
        data: [],
        object: 'list',
        has_more: false,
        url: '',
      } as Stripe.ApiList<Stripe.Refund>;
    }

    // Get refunds for those charges
    const refunds = await this.stripe.refunds.list({ limit: 100 });
    const customerRefunds = refunds.data.filter(refund =>
      chargeIds.includes(refund.charge as string),
    );

    return {
      ...refunds,
      data: customerRefunds,
    };
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<Stripe.Refund> {
    return this.stripe.refunds.retrieve(refundId);
  }

  /**
   * Issue a credit note (for invoices)
   */
  async createCreditNote(
    invoiceId: string,
    amount?: number,
    reason?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.CreditNote> {
    const creditNoteParams: Stripe.CreditNoteCreateParams = {
      invoice: invoiceId,
      reason: (reason as any) || 'other',
      metadata,
    };

    if (amount) {
      creditNoteParams.amount = amount; // Amount in cents
    }

    return this.stripe.creditNotes.create(creditNoteParams);
  }

  /**
   * List credit notes for a customer
   */
  async listCreditNotes(stripeCustomerId: string): Promise<Stripe.ApiList<Stripe.CreditNote>> {
    return this.stripe.creditNotes.list({ customer: stripeCustomerId });
  }

  /**
   * Void a credit note (if needed)
   */
  async voidCreditNote(creditNoteId: string): Promise<Stripe.CreditNote> {
    return this.stripe.creditNotes.voidCreditNote(creditNoteId);
  }

  /**
   * Create a customer balance transaction (add credit to customer account)
   */
  async addCustomerCredit(
    stripeCustomerId: string,
    amount: number,
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.CustomerBalanceTransaction> {
    return this.stripe.customers.createBalanceTransaction(stripeCustomerId, {
      amount: -Math.abs(amount), // Negative amount creates credit
      currency: 'usd',
      description: description || 'Credit added to account',
      metadata,
    });
  }

  /**
   * Get customer balance
   */
  async getCustomerBalance(stripeCustomerId: string): Promise<number> {
    const customer = await this.stripe.customers.retrieve(stripeCustomerId);
    return (customer as Stripe.Customer).balance || 0;
  }

  /**
   * List customer balance transactions
   */
  async listCustomerBalanceTransactions(
    stripeCustomerId: string,
  ): Promise<Stripe.ApiList<Stripe.CustomerBalanceTransaction>> {
    return this.stripe.customers.listBalanceTransactions(stripeCustomerId);
  }

  // Notification stub (replace with real email/notification logic)
  private async notifyUser(email: string, subject: string, message: string) {
    this.logger.log(`[NOTIFY USER] To: ${email} | Subject: ${subject} | Message: ${message}`);
    // TODO: Integrate real email/notification service
  }

  async handleWebhookEvent(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type}`, 'StripeWebhook');

    try {
      switch (event.type) {
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const profile = await Profile.findOne({ where: { stripeCustomerId: customerId } });
          if (profile) {
            await this.notifyUser(
              profile.email,
              'Payment Failed',
              'Your recent payment failed. Please update your payment method.',
            );
            this.logger.warn(
              `Payment failed for user ${profile.email} (${profile.id})`,
              'StripeWebhook',
            );
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const profile = await Profile.findOne({ where: { stripeCustomerId: customerId } });
          if (profile) {
            await this.notifyUser(
              profile.email,
              'Payment Successful',
              `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been processed successfully.`,
            );
            this.logger.log(
              `Payment succeeded for user ${profile.email} (${profile.id}): $${(invoice.amount_paid / 100).toFixed(2)}`,
              'StripeWebhook',
            );
          }
          break;
        }
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const customerId = session.customer as string;
          const profile = await Profile.findOne({ where: { stripeCustomerId: customerId } });
          if (profile) {
            this.logger.log(
              `Checkout session completed for user ${profile.email} (${profile.id})`,
              'StripeWebhook',
            );
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const profile = await Profile.findOne({ where: { stripeCustomerId: customerId } });
          if (profile) {
            profile.stripeSubscriptionId = subscription.id;
            profile.subscriptionStatus = subscription.status;

            // Determine plan from subscription items
            const planId = subscription.items.data[0]?.price.id;
            let currentPlan = 'freemium';
            if (planId === this.priceIds.monthly) currentPlan = 'monthly';
            else if (planId === this.priceIds.annual) currentPlan = 'annual';
            profile.currentPlan = currentPlan;

            const renewalTimestamp = (subscription as any).current_period_end;
            profile.planRenewalDate = renewalTimestamp ? new Date(renewalTimestamp * 1000) : null;

            await profile.save();

            this.logger.log(
              `Subscription ${event.type} for user ${profile.email} (${profile.id}): ${subscription.status} (${currentPlan})`,
              'StripeWebhook',
            );

            // Send appropriate notifications
            if (event.type === 'customer.subscription.created') {
              await this.notifyUser(
                profile.email,
                'Welcome to Spend Smart!',
                `Your ${currentPlan} subscription is now active. Welcome aboard!`,
              );
            } else if (event.type === 'customer.subscription.deleted') {
              await this.notifyUser(
                profile.email,
                'Subscription Cancelled',
                "Your subscription has been cancelled. We're sorry to see you go!",
              );
              this.logger.warn(
                `Subscription cancelled for user ${profile.email} (${profile.id})`,
                'StripeWebhook',
              );
            } else if (event.type === 'customer.subscription.updated') {
              await this.notifyUser(
                profile.email,
                'Subscription Updated',
                `Your subscription has been updated to ${currentPlan} plan.`,
              );
            }
          }
          break;
        }
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`, 'StripeWebhook');
          break;
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}: ${error.message}`,
        error.stack,
        'StripeWebhook',
      );
      throw error; // Re-throw to ensure webhook retry
    }

    return { received: true };
  }

  async getInvoices(stripeCustomerId: string) {
    return this.stripe.invoices.list({ customer: stripeCustomerId });
  }

  async getPaymentHistory(stripeCustomerId: string) {
    // Payment history can be derived from invoices
    const invoices = await this.stripe.invoices.list({ customer: stripeCustomerId });
    return invoices.data.map(inv => ({
      id: inv.id,
      amount_paid: inv.amount_paid,
      status: inv.status,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
    }));
  }

  async getSubscriptionStatus(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  constructEventFromRequest(req: any, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get('env.stripe.webhookSecret');
    if (!webhookSecret) throw new Error('Missing Stripe webhook secret');
    return this.stripe.webhooks.constructEvent(
      req['rawBody'] || req.body,
      signature,
      webhookSecret,
    );
  }

  /**
   * Create a Stripe Checkout Session for a subscription
   */
  async createCheckoutSession(
    stripeCustomerId: string,
    plan: 'monthly' | 'annual',
    successUrl: string,
    cancelUrl: string,
  ) {
    const priceId = this.priceIds[plan];
    if (!priceId) throw new Error('Invalid or missing price ID for plan');
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  /**
   * Create a Stripe Customer Portal Session
   */
  async createCustomerPortalSession(stripeCustomerId: string, returnUrl: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
  }
}
