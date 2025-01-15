package e_commerce.BackEnd.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import e_commerce.BackEnd.dto.PaymentInfo;
import e_commerce.BackEnd.dto.Purchase;
import e_commerce.BackEnd.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
