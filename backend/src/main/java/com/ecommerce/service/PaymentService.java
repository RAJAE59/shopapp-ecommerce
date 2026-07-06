package com.ecommerce.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Crée un PaymentIntent Stripe pour une commande
     * @param montant Le montant en euros (ex: 99.99)
     * @param orderId L'ID de la commande
     * @return Map contenant clientSecret et paymentIntentId
     */
    public Map<String, String> createPaymentIntent(BigDecimal montant, Long orderId) throws StripeException {
        // Stripe utilise les centimes (ex: 9999 pour 99.99€)
        long montantEnCentimes = montant.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(montantEnCentimes)
                .setCurrency("eur")
                .putMetadata("order_id", orderId.toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Map<String, String> result = new HashMap<>();
        result.put("clientSecret", paymentIntent.getClientSecret());
        result.put("paymentIntentId", paymentIntent.getId());
        return result;
    }

    /**
     * Vérifie le statut d'un PaymentIntent
     */
    public String getPaymentStatus(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.getStatus();
    }
}
