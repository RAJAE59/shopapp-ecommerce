package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.model.*;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order createOrder(User user, OrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // Créer la commande d'abord
        Order order = Order.builder()
                .user(user)
                .statut(Order.OrderStatus.PENDING)
                .adresseLivraison(request.getAdresseLivraison())
                .total(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        // Ajouter les articles
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour: " + product.getNom());
            }

            // Décrémenter le stock
            product.setStock(product.getStock() - itemRequest.getQuantite());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantite(itemRequest.getQuantite())
                    .prixUnitaire(product.getPrix())
                    .build();
            items.add(item);

            total = total.add(product.getPrix().multiply(BigDecimal.valueOf(itemRequest.getQuantite())));
        }

        order.setItems(items);
        order.setTotal(total);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée: " + id));
    }

    public Order updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        Order order = getOrderById(id);
        order.setStatut(newStatus);
        return orderRepository.save(order);
    }
}
