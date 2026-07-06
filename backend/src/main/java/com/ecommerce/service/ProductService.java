package com.ecommerce.service;

import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByActifTrue(pageable);
    }

    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActifTrue(categoryId, pageable);
    }

    public Page<Product> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + id));
    }

    public Product createProduct(String nom, String description, BigDecimal prix,
                                  Integer stock, String imageUrl, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        Product product = Product.builder()
                .nom(nom)
                .description(description)
                .prix(prix)
                .stock(stock)
                .imageUrl(imageUrl)
                .category(category)
                .actif(true)
                .build();

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, String nom, String description,
                                  BigDecimal prix, Integer stock, String imageUrl) {
        Product product = getProductById(id);
        product.setNom(nom);
        product.setDescription(description);
        product.setPrix(prix);
        product.setStock(stock);
        product.setImageUrl(imageUrl);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActif(false);
        productRepository.save(product);
    }
}
