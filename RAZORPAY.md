# Razorpay payments

How payments work for Hourlyzo bookings. Part 1 is for the Flutter developer. Part 2 is for whoever runs the server.

The flow is the same in test mode and live mode. Only the keys on the server change.

```
App                              API (hourly-booking-api)                 Razorpay
 | POST /v1/bookings  ---------->  booking = pending_payment (room held 15 min)
 | POST /v1/payments/razorpay/orders {bookingId}
 |                    ---------->  creates order ------------------------>  order_xxx
 | <-- { keyId, orderId, amount, currency, name, description, payBefore }
 | open Razorpay Checkout (keyId + orderId) --------------------------->  guest pays (UPI / card / netbanking)
 | <-- onSuccess(paymentId, orderId, signature) ------------------------
 | POST /v1/payments/razorpay/verify {bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature}
 |                    ---------->  checks signature + amount, booking = confirmed
 | <-- { bookingStatus: "confirmed", paymentStatus: "paid" }
 |                                 <---- webhook payment.captured (backup, if the app closed early)
```

## Part 1: Flutter app

### 1. Add the package

```yaml
# pubspec.yaml
dependencies:
  razorpay_flutter: ^1.3.7
```

- **Android:** set `minSdkVersion 19` or higher. If you use ProGuard/R8, add the Razorpay keep rules from the package README.
- **iOS:** set the deployment target to 10.0 or higher, then run `pod install`.

### 2. Pay for a booking

All calls use the user's token in `Authorization: Bearer <accessToken>`. The base URL is `https://hourly-booking-api.onrender.com/v1`.

```dart
import 'package:razorpay_flutter/razorpay_flutter.dart';

class BookingPayment {
  final _razorpay = Razorpay();
  late int _bookingId;

  BookingPayment() {
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (_) {});
  }

  /// Call after POST /bookings returned the booking id.
  Future<void> pay(int bookingId, {required String phone, String? email}) async {
    _bookingId = bookingId;
    // POST /payments/razorpay/orders
    final order = await api.post('/payments/razorpay/orders', {'bookingId': bookingId});

    _razorpay.open({
      'key': order['keyId'],          // from the server, never hard-coded
      'order_id': order['orderId'],
      'amount': order['amount'],      // paise, already set by the server
      'currency': order['currency'],
      'name': order['name'],          // "Hourlyzo"
      'description': order['description'],
      'prefill': {'contact': phone, if (email != null) 'email': email},
      'theme': {'color': '#1F2A44'},
    });
  }

  Future<void> _onSuccess(PaymentSuccessResponse r) async {
    // Never mark the booking paid in the app. Ask the server to verify.
    final result = await api.post('/payments/razorpay/verify', {
      'bookingId': _bookingId,
      'razorpay_order_id': r.orderId,
      'razorpay_payment_id': r.paymentId,
      'razorpay_signature': r.signature,
    });
    if (result['bookingStatus'] == 'confirmed') {
      // show the booking confirmation screen
    }
  }

  void _onError(PaymentFailureResponse r) {
    // The guest cancelled or the payment failed. The booking stays pending_payment
    // until payBefore, so the guest can retry with pay(bookingId) again.
  }

  void dispose() => _razorpay.clear();
}
```

Rules for the app:
- **Don't put the key secret in the app.** The app only receives `keyId`, which is public.
- **Always confirm through `/verify`.** If the call fails, for example because the network dropped, refresh `GET /v1/bookings/mine`. The webhook will already have confirmed the booking.
- **Retrying is safe.** Calling `/orders` again for the same booking reuses the open order.
- **Unpaid bookings expire.** After `payBefore` (15 minutes), the booking is cancelled and the room released. Create a new booking to try again.

### 3. Cancelling

`PUT /v1/bookings/:id/cancel` now also returns `refund`:
- `{ refunded: true, amountPaise, status }`: cancelled at least 48 hours before check-in. The guest gets a full refund to the original payment method.
- `{ refunded: false, reason }`: cancelled less than 48 hours before check-in, so no refund. This matches hourlyzo.com/refund-policy.

### 4. Test payments (test mode, no real money)

| Method | What to enter |
|---|---|
| UPI success | `success@razorpay` |
| UPI failure | `failure@razorpay` |
| Card | `4111 1111 1111 1111` (Visa) or `5267 3181 8797 5449` (Mastercard), any future expiry, any CVV, OTP from the test page |
| Netbanking | Any bank, then click "Success" or "Failure" on the test page |

Payments show up under Test Mode in the Razorpay dashboard.

## Part 2: server setup

Environment variables (Render → hourly-booking-api → Environment):

| Key | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_...` now, `rzp_live_...` after activation |
| `RAZORPAY_KEY_SECRET` | the secret shown once when you generate the key |
| `RAZORPAY_WEBHOOK_SECRET` | any long random string; use the same one in the dashboard webhook |
| `PAYMENT_WINDOW_MINUTES` | optional, defaults to 15 |
| `FULL_REFUND_WINDOW_HOURS` | optional, defaults to 48 |

Webhook (Razorpay dashboard → Settings → Webhooks → Add):
- **URL:** `https://hourly-booking-api.onrender.com/v1/payments/razorpay/webhook`
- **Secret:** the same value as `RAZORPAY_WEBHOOK_SECRET`.
- **Events:** `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`.
- Test mode and live mode each have their own webhook and keys. Set both up.

Going live after Razorpay activates the account:
1. Generate live keys and replace the two key variables on Render.
2. Add the live-mode webhook.
3. Redeploy.

The app needs no changes.

Payment records are stored in the `booking_payments` table, which the server creates automatically on start.
