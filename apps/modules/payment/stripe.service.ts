import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { Profile } from 'apps/libs/postgres/models/profile.model';
import { Logger } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger('StripeService');

  // Example price IDs (replace with your real Stripe price IDs)
  private readonly priceIds = {
    freemium: null, // No price for free tier
    core: 'price_5usd_monthly',
    pro: 'price_10usd_monthly', // Replace with real Stripe price ID
    core_annual: 'price_48usd_annual', // Replace with real Stripe price ID
    pro_annual: 'price_96usd_annual', // Replace with real Stripe price ID
  };

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createSubscription(
    stripeCustomerId: string,
    plan: 'core' | 'pro' | 'core_annual' | 'pro_annual',
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

  async updateSubscription(
    subscriptionId: string,
    newPlan: 'core' | 'pro' | 'core_annual' | 'pro_annual',
  ) {
    const priceId = this.priceIds[newPlan];
    if (!priceId) throw new Error('Invalid or missing price ID for plan');
    return this.stripe.subscriptions.update(subscriptionId, {
      items: [{ price: priceId }],
      proration_behavior: 'create_prorations',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  }

  // Notification stub (replace with real email/notification logic)
  private async notifyUser(email: string, subject: string, message: string) {
    this.logger.log(`[NOTIFY USER] To: ${email} | Subject: ${subject} | Message: ${message}`);
    // TODO: Integrate real email/notification service
  }

  async handleWebhookEvent(event: Stripe.Event) {
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
          if (planId === this.priceIds.core) currentPlan = 'core';
          else if (planId === this.priceIds.pro) currentPlan = 'pro';
          else if (planId === this.priceIds.core_annual) currentPlan = 'core_annual';
          else if (planId === this.priceIds.pro_annual) currentPlan = 'pro_annual';
          profile.currentPlan = currentPlan;
          const renewalTimestamp = (subscription as any).current_period_end;
          profile.planRenewalDate = renewalTimestamp ? new Date(renewalTimestamp * 1000) : null;
          await profile.save();
          this.logger.log(
            `Subscription status updated for user ${profile.email} (${profile.id}): ${subscription.status} (${currentPlan})`,
            'StripeWebhook',
          );
          // Notify user on cancellation
          if (event.type === 'customer.subscription.deleted') {
            await this.notifyUser(
              profile.email,
              'Subscription Cancelled',
              'Your subscription has been cancelled.',
            );
            this.logger.warn(
              `Subscription cancelled for user ${profile.email} (${profile.id})`,
              'StripeWebhook',
            );
          }
        }
        break;
      }
      // Add more cases as needed
      default:
        break;
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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
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
    plan: 'core' | 'pro' | 'core_annual' | 'pro_annual',
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
