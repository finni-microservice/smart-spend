# Stripe Controller - cURL Examples

## Base URL

Assuming your API is running on `http://localhost:3000` (adjust as needed)

## 1. Create Customer

```bash
curl -X POST http://localhost:3000/stripe/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

## 2. Create Subscription

```bash
curl -X POST http://localhost:3000/stripe/subscription \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_example123",
    "plan": "monthly",
    "paymentMethodId": "pm_example123",
    "trialDays": 14
  }'
```

### Available plans:

- `monthly` - $5/month
- `annual` - $48/year ($4/month billed annually)

## 3. Update Subscription

```bash
curl -X POST http://localhost:3000/stripe/subscription/update \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_example123",
    "newPlan": "annual"
  }'
```

## 4. Cancel Subscription

```bash
curl -X POST http://localhost:3000/stripe/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_example123"
  }'
```

## 5. Handle Webhook (Stripe will call this)

```bash
curl -X POST http://localhost:3000/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: your_webhook_signature" \
  -d '{
    "id": "evt_example123",
    "object": "event",
    "type": "customer.subscription.updated"
  }'
```

## 6. Get Invoices

```bash
curl -X POST http://localhost:3000/stripe/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_example123"
  }'
```

## 7. Get Payment History

```bash
curl -X POST http://localhost:3000/stripe/payment-history \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_example123"
  }'
```

## 8. Get Subscription Status

```bash
curl -X POST http://localhost:3000/stripe/subscription/status \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_example123"
  }'
```

## 9. Create Checkout Session

```bash
curl -X POST http://localhost:3000/stripe/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_example123",
    "plan": "monthly",
    "successUrl": "https://yourapp.com/success",
    "cancelUrl": "https://yourapp.com/cancel"
  }'
```

## 10. Create Customer Portal Session

```bash
curl -X POST http://localhost:3000/stripe/customer-portal \
  -H "Content-Type: application/json" \
  -d '{
    "stripeCustomerId": "cus_example123",
    "returnUrl": "https://yourapp.com/dashboard"
  }'
```

## 11. List All Subscriptions (Admin)

```bash
curl -X POST http://localhost:3000/stripe/admin/subscriptions \
  -H "Content-Type: application/json"
```

## Notes:

- Replace `localhost:3000` with your actual API URL
- Replace example IDs (cus_example123, sub_example123, etc.) with real Stripe IDs
- For the webhook endpoint, Stripe will automatically provide the signature header
- The admin endpoint may require additional authentication in production
- All endpoints use POST method as defined in the controller
