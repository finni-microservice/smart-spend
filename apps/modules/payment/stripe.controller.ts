import { Controller, Post, Body, Req, Res, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { Profile } from 'apps/libs/postgres/models/profile.model';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('customer')
  async createCustomer(@Body() body: { email: string; name?: string }) {
    return this.stripeService.createCustomer(body.email, body.name);
  }

  @Post('subscription')
  async createSubscription(
    @Body()
    body: {
      stripeCustomerId: string;
      plan: 'core' | 'pro' | 'core_annual' | 'pro_annual';
      paymentMethodId: string;
      trialDays?: number;
    },
  ) {
    return this.stripeService.createSubscription(
      body.stripeCustomerId,
      body.plan,
      body.paymentMethodId,
      body.trialDays,
    );
  }

  @Post('subscription/update')
  async updateSubscription(
    @Body()
    body: {
      subscriptionId: string;
      newPlan: 'core' | 'pro' | 'core_annual' | 'pro_annual';
    },
  ) {
    return this.stripeService.updateSubscription(body.subscriptionId, body.newPlan);
  }

  @Post('subscription/cancel')
  async cancelSubscription(@Body() body: { subscriptionId: string }) {
    return this.stripeService.cancelSubscription(body.subscriptionId);
  }

  @Post('webhook')
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
  async getInvoices(@Body() body: { stripeCustomerId: string }) {
    return this.stripeService.getInvoices(body.stripeCustomerId);
  }

  @Post('payment-history')
  async getPaymentHistory(@Body() body: { stripeCustomerId: string }) {
    return this.stripeService.getPaymentHistory(body.stripeCustomerId);
  }

  @Post('subscription/status')
  async getSubscriptionStatus(@Body() body: { subscriptionId: string }) {
    return this.stripeService.getSubscriptionStatus(body.subscriptionId);
  }

  @Post('checkout-session')
  async createCheckoutSession(
    @Body()
    body: {
      stripeCustomerId: string;
      plan: 'core' | 'pro' | 'core_annual' | 'pro_annual';
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    return this.stripeService.createCheckoutSession(
      body.stripeCustomerId,
      body.plan,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('customer-portal')
  async createCustomerPortalSession(@Body() body: { stripeCustomerId: string; returnUrl: string }) {
    return this.stripeService.createCustomerPortalSession(body.stripeCustomerId, body.returnUrl);
  }

  @Post('admin/subscriptions')
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
}
