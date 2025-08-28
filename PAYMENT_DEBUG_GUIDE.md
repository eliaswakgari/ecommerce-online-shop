# Payment Debug Guide

## Issue: Payment Status Showing "Pending" After Successful Payment

### What's happening:
- User completes payment successfully with Stripe
- Payment shows as "Pending" instead of "Completed" in the order confirmation
- This indicates the webhook isn't properly updating the order status

### Debug Steps:

#### 1. Check Environment Variables
Make sure these are set in your backend `.env` file:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 2. Check Webhook Configuration
- In development, webhooks often don't work without ngrok or similar tunneling
- The webhook endpoint is: `POST /api/orders/webhook`
- For local development, you can use Stripe CLI: `stripe listen --forward-to localhost:5000/api/orders/webhook`

#### 3. Test Payment Confirmation
1. Start your backend server
2. Make a test order and payment
3. Check browser console for these messages:
   - `🔄 Attempting fallback payment confirmation...`
   - `✅ Payment confirmation successful:` (success)
   - `⚠️ Fallback confirmation failed:` (needs attention)

#### 4. Manual Testing
Use these test card numbers with Stripe:
- **Success**: 4242 4242 4242 4242
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)

#### 5. Check Order Status Manually
After payment, check the order in your database or admin panel:
- `isPaid` should be `true`
- `status` should be `"processing"`
- `paidAt` should have a timestamp
- `paymentResult` should contain Stripe payment info

#### 6. Use the Debug Endpoint
Call: `GET /api/orders/debug/:orderId` to check order status

#### 7. Use the Refresh Button
On the order confirmation page, click "Refresh Status" to manually update

### Solutions:

#### For Development (Quick Fix):
1. The enhanced fallback mechanism should handle most cases
2. Use the "Refresh Status" button on order confirmation page
3. Check browser console for debugging information

#### For Production:
1. Set up proper webhook endpoints with HTTPS
2. Configure webhook secret in environment variables
3. Use Stripe CLI for local webhook testing

### Testing the Enhanced System:

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Make Test Order**: Use test card 4242 4242 4242 4242
4. **Check Console**: Look for payment confirmation messages
5. **Verify Status**: Should show "✅ Completed" on order confirmation
6. **If Still Pending**: Click "Refresh Status" button

### Common Issues:

1. **Webhook Secret Missing**: Set `STRIPE_WEBHOOK_SECRET` in `.env`
2. **CORS Issues**: Check CORS configuration in `app.js`
3. **Authentication**: Ensure user is logged in for fallback confirmation
4. **Network Issues**: Check if API calls are reaching the backend

### Logs to Watch:
- Browser console for frontend debugging
- Backend console for webhook and confirmation logs
- Look for: `📨 Webhook received`, `✅ Payment confirmation successful`