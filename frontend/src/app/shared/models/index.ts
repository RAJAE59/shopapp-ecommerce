// models/user.model.ts
export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  email: string;
  nom: string;
  role: string;
}

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  imageUrl: string;
  category: Category;
  actif: boolean;
}

export interface Category {
  id: number;
  nom: string;
  description: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Order {
  id: number;
  user: User;
  statut: OrderStatus;
  total: number;
  adresseLivraison: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantite: number;
  prixUnitaire: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface CartItem {
  product: Product;
  quantite: number;
}
