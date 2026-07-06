-- V1__init_schema.sql

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    category_id BIGINT REFERENCES categories(id),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    statut VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(10,2) NOT NULL,
    adresse_livraison TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT REFERENCES products(id),
    quantite INTEGER NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT UNIQUE REFERENCES orders(id),
    stripe_payment_intent_id VARCHAR(255),
    statut VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    montant DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données de test
INSERT INTO categories (nom, description) VALUES
('Électronique', 'Téléphones, PC, accessoires'),
('Vêtements', 'Mode homme et femme'),
('Maison', 'Décoration et mobilier'),
('Livres', 'Romans, BD, essais');

INSERT INTO users (nom, email, password_hash, role) VALUES
('Admin', 'admin@ecommerce.com', '$2a$10$dummyHashForAdmin', 'ADMIN'),
('Client Test', 'client@test.com', '$2a$10$dummyHashForClient', 'CUSTOMER');

INSERT INTO products (nom, description, prix, stock, category_id) VALUES
('iPhone 15', 'Smartphone Apple dernière génération', 999.99, 50, 1),
('Samsung Galaxy S24', 'Smartphone Android haut de gamme', 849.99, 30, 1),
('T-Shirt Premium', 'Coton bio, coupe slim', 29.99, 100, 2),
('Lampe Design', 'Lampe LED moderne pour salon', 79.99, 25, 3),
('Clean Code', 'Le livre de référence pour les développeurs', 34.99, 60, 4);
