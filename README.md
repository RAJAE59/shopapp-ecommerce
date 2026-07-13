# 🛒 ShopApp — E-commerce Full Stack

> Projet portfolio — Application e-commerce complète avec Java Spring Boot, Angular et PostgreSQL

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![Angular](https://img.shields.io/badge/Angular-17-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Stripe](https://img.shields.io/badge/Stripe-Intégré-purple)

---

## 📋 Fonctionnalités

### Côté Client
- 🔐 Inscription / Connexion sécurisée (JWT)
- 🛍️ Catalogue produits avec recherche et filtres par catégorie
- 🛒 Panier persistant (localStorage)
- 📦 Passage de commande avec adresse de livraison
- 💳 Paiement sécurisé via Stripe (sandbox)
- 📜 Historique des commandes avec timeline de statut

### Côté Admin
- 📊 Dashboard avec statistiques en temps réel
- 🏷️ Gestion complète des produits (CRUD)
- 📋 Gestion des commandes avec mise à jour de statut
- ⚠️ Alertes stock faible

---

## 🏗️ Architecture

```
ecommerce/
├── backend/               # API REST Spring Boot
│   └── src/main/java/com/ecommerce/
│       ├── config/        # Security, CORS
│       ├── controller/    # Endpoints REST
│       ├── service/       # Logique métier
│       ├── repository/    # JPA Repositories
│       ├── model/         # Entités JPA
│       ├── dto/           # Request/Response DTOs
│       ├── security/      # JWT Filter & Utils
│       └── exception/     # Global Exception Handler
│
└── frontend/              # Application Angular
    └── src/app/
        ├── core/          # Services, Guards, Interceptors
        ├── features/      # Auth, Catalogue, Cart, Checkout, Orders, Admin
        └── shared/        # Composants réutilisables, Modèles
```

---

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|------------|
| Backend | Java 17 + Spring Boot 3.2 |
| Sécurité | Spring Security + JWT (jjwt) |
| Base de données | PostgreSQL 15 |
| Migrations | Flyway |
| Paiement | Stripe Java SDK |
| Frontend | Angular 17 (Standalone Components) |
| UI | Angular Material |
| Déploiement | Railway (backend) + Vercel (frontend) |

---

## 🚀 Installation et lancement

### Prérequis
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm
- PostgreSQL 14+
- Un compte Stripe (gratuit pour le sandbox)

### 1. Base de données

```sql
-- Créer la BDD
createdb ecommerce_db

-- Flyway s'occupe des migrations automatiquement au démarrage
```

### 2. Backend

```bash
cd backend

# Configurer les variables (src/main/resources/application.yml)
# - spring.datasource.username / password
# - stripe.secret-key (depuis https://dashboard.stripe.com/test/apikeys)

mvn spring-boot:run
# API disponible sur https://app-99525641-4e5f-4149-87c2-05d9cad21b16.cleverapps.io
```

### 3. Frontend

```bash
cd frontend
npm install
ng serve
# App disponible sur http://localhost:4200
```

---

## 📡 API Endpoints

### Auth
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |

### Produits (public)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/products` | Liste paginée (filtres: search, categoryId) |
| GET | `/api/products/{id}` | Détail produit |
| GET | `/api/categories` | Toutes les catégories |

### Commandes (authentifié)
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/orders` | Créer une commande |
| GET | `/api/orders/me` | Mes commandes |
| POST | `/api/orders/{id}/payment-intent` | Créer PaymentIntent Stripe |

### Admin (role ADMIN)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/admin/stats` | Statistiques globales |
| GET | `/api/admin/orders` | Toutes les commandes |
| PUT | `/api/admin/orders/{id}/status` | Changer le statut |
| GET | `/api/admin/products/low-stock` | Produits en rupture |

---

## 🧪 Comptes de test

```
Admin:   admin@ecommerce.com  / admin123
Client:  client@test.com      / client123

Carte Stripe test: 4242 4242 4242 4242
Expiration: 12/26  CVV: 123
```

---

## 📸 Captures d'écran

> Ajouter des screenshots de l'app ici pour le portfolio

---

## 🌐 Déploiement

### Backend sur Railway
```bash
# Connecter le repo GitHub sur Railway
# Ajouter les variables d'environnement (DATABASE_URL, stripe.secret-key, app.jwt.secret)
# Railway détecte automatiquement le pom.xml
```

### Frontend sur Vercel
```bash
npm run build
# Ou connecter le repo GitHub sur Vercel
# Build command: ng build
# Output directory: dist/ecommerce-frontend
```

---

## 👨‍💻 Auteur

Portfolio projet — Développeur Full Stack Java/Angular

---

*Ce projet démontre la maîtrise de : Spring Boot, Spring Security, JPA/Hibernate, JWT, PostgreSQL, Flyway, Angular, RxJS, Angular Material, Stripe API.*
