import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] {
    return this.cartSubject.getValue();
  }

  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantite, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.product.prix * item.quantite, 0);
  }

  addToCart(product: Product, quantite = 1): void {
    const items = [...this.items];
    const existing = items.find(i => i.product.id === product.id);

    if (existing) {
      existing.quantite += quantite;
    } else {
      items.push({ product, quantite });
    }

    this.updateCart(items);
  }

  removeFromCart(productId: number): void {
    this.updateCart(this.items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantite: number): void {
    if (quantite <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const items = this.items.map(i =>
      i.product.id === productId ? { ...i, quantite } : i
    );
    this.updateCart(items);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartSubject.next(items);
  }

  private loadCart(): CartItem[] {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  }
}
