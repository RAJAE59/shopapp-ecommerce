// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../shared/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatSnackBarModule
  ],
  template: `
    <div class="cart-container">
      <h1>Mon Panier</h1>

      <!-- Panier vide -->
      <div class="empty-cart" *ngIf="items.length === 0">
        <mat-icon>shopping_cart</mat-icon>
        <p>Votre panier est vide</p>
        <a mat-raised-button color="primary" routerLink="/catalogue">Voir le catalogue</a>
      </div>

      <!-- Articles -->
      <div class="cart-content" *ngIf="items.length > 0">
        <div class="cart-items">
          <mat-card class="cart-item" *ngFor="let item of items">
            <div class="item-image">
              <img [src]="item.product.imageUrl || 'https://via.placeholder.com/100'" [alt]="item.product.nom">
            </div>
            <div class="item-info">
              <h3>{{ item.product.nom }}</h3>
              <p class="item-category">{{ item.product.category?.nom }}</p>
              <p class="item-price">{{ item.product.prix | currency:'MAD' }} / unité</p>
            </div>
            <div class="item-quantity">
              <button mat-icon-button (click)="decreaseQty(item)">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
              <span class="qty">{{ item.quantite }}</span>
              <button mat-icon-button (click)="increaseQty(item)"
                      [disabled]="item.quantite >= item.product.stock">
                <mat-icon>add_circle_outline</mat-icon>
              </button>
            </div>
            <div class="item-total">
              <strong>{{ (item.product.prix * item.quantite) | currency:'MAD' }}</strong>
            </div>
            <button mat-icon-button color="warn" (click)="removeItem(item)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card>
        </div>

        <!-- Récapitulatif -->
        <mat-card class="cart-summary">
          <mat-card-content>
            <h2>Récapitulatif</h2>
            <mat-divider></mat-divider>

            <div class="summary-row" *ngFor="let item of items">
              <span>{{ item.product.nom }} x{{ item.quantite }}</span>
              <span>{{ (item.product.prix * item.quantite) | currency:'MAD' }}</span>
            </div>

            <mat-divider></mat-divider>

            <div class="summary-row total">
              <strong>Total</strong>
              <strong class="total-price">{{ totalPrice | currency:'MAD' }}</strong>
            </div>

            <a mat-raised-button color="primary" routerLink="/checkout" class="checkout-btn">
              <mat-icon>payment</mat-icon>
              Passer la commande
            </a>

            <button mat-stroked-button color="warn" (click)="clearCart()" class="clear-btn">
              <mat-icon>delete_sweep</mat-icon>
              Vider le panier
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .cart-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; }
    .empty-cart { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 0; color: #666; }
    .empty-cart mat-icon { font-size: 80px; width: 80px; height: 80px; color: #ccc; }
    .cart-content { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    @media (max-width: 768px) { .cart-content { grid-template-columns: 1fr; } }
    .cart-items { display: flex; flex-direction: column; gap: 12px; }
    .cart-item { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .item-image img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0 0 4px; font-size: 1rem; font-weight: 600; }
    .item-category { color: #666; font-size: 0.8rem; margin: 0; }
    .item-price { color: #1976d2; font-size: 0.9rem; margin: 4px 0 0; }
    .item-quantity { display: flex; align-items: center; gap: 4px; }
    .qty { font-size: 1.1rem; font-weight: 600; min-width: 32px; text-align: center; }
    .item-total { min-width: 80px; text-align: right; }
    .cart-summary { height: fit-content; position: sticky; top: 80px; }
    .cart-summary h2 { margin-top: 0; font-size: 1.2rem; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; color: #444; }
    .summary-row.total { font-size: 1.1rem; padding-top: 12px; }
    .total-price { color: #1976d2; font-size: 1.3rem; }
    .checkout-btn { width: 100%; margin-top: 20px; height: 48px; font-size: 1rem; }
    .clear-btn { width: 100%; margin-top: 8px; }
    mat-divider { margin: 8px 0; }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];

  constructor(private cartService: CartService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => this.items = items);
  }

  get totalPrice(): number { return this.cartService.totalPrice; }

  increaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantite + 1);
  }

  decreaseQty(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantite - 1);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
    this.snackBar.open(`${item.product.nom} retiré du panier`, 'OK', { duration: 2000 });
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.snackBar.open('Panier vidé', 'OK', { duration: 2000 });
  }
}
