package com.ecommerce.controller;

import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total commandes
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);

        // Total utilisateurs
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);

        // Total produits actifs
        long totalProducts = productRepository.findByActifTrue(PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
        stats.put("totalProducts", totalProducts);

        // Chiffre d'affaires total (commandes PAID)
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal revenue = allOrders.stream()
                .filter(o -> o.getStatut() == Order.OrderStatus.PAID)
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", revenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
                                                    @RequestParam Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        order.setStatut(status);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/products/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        // Produits avec moins de 5 articles en stock
        return ResponseEntity.ok(
            productRepository.findAll().stream()
                .filter(p -> p.getActif() && p.getStock() < 5)
                .toList()
        );
    }
}
