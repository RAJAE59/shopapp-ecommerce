import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatChipsModule, MatDividerModule
  ],
  template: `
    <div class="product-detail-container">
      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="product-detail" *ngIf="!loading && product">
        <nav class="breadcrumb">
          <a routerLink="/catalogue">Catalogue</a>
          <mat-icon>chevron_right</mat-icon>
          <span>{{ product.nom }}</span>
        </nav>

        <div class="detail-grid">
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/500x400?text=' + product.nom"
                 [alt]="product.nom">
            <div class="stock-badge" [class.out-of-stock]="product.stock === 0">
              {{ product.stock > 0 ? 'En stock' : 'Rupture de stock' }}
            </div>
          </div>

          <div class="product-info">
            <mat-chip class="category-chip">{{ product.category?.nom }}</mat-chip>
            <h1>{{ product.nom }}</h1>
            <div class="price-block">
              <span class="price">{{ product.prix | currency:'EUR' }}</span>
              <span class="stock-info">{{ product.stock }} unités disponibles</span>
            </div>

            <mat-divider></mat-divider>
            <p class="description">{{ product.description }}</p>
            <mat-divider></mat-divider>

            <div class="add-to-cart" *ngIf="product.stock > 0">
              <div class="quantity-selector">
                <button mat-icon-button (click)="decreaseQty()">
                  <mat-icon>remove</mat-icon>
                </button>
                <input type="number" [(ngModel)]="qty" [min]="1" [max]="product.stock" class="qty-input">
                <button mat-icon-button (click)="increaseQty()">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <button mat-raised-button color="primary" class="add-btn" (click)="addToCart()">
                <mat-icon>shopping_cart</mat-icon>
                Ajouter au panier — {{ product.prix * qty | currency:'EUR' }}
              </button>
            </div>

            <button mat-raised-button disabled *ngIf="product.stock === 0" class="add-btn">
              Produit indisponible
            </button>

            <div class="delivery-info">
              <div class="delivery-item">
                <mat-icon>local_shipping</mat-icon>
                <span>Livraison gratuite dès 50DH</span>
              </div>
              <div class="delivery-item">
                <mat-icon>replay</mat-icon>
                <span>Retour gratuit sous 30 jours</span>
              </div>
              <div class="delivery-item">
                <mat-icon>lock</mat-icon>
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="not-found" *ngIf="!loading && !product">
        <mat-icon>error</mat-icon>
        <p>Produit introuvable</p>
        <a mat-raised-button routerLink="/catalogue">Retour au catalogue</a>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    .loading, .not-found { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px; }
    .breadcrumb { display: flex; align-items: center; gap: 4px; margin-bottom: 24px; color: #666; font-size: 0.9rem; }
    .breadcrumb a { color: #1976d2; text-decoration: none; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
    .product-image { position: relative; }
    .product-image img { width: 100%; border-radius: 12px; object-fit: cover; max-height: 440px; }
    .stock-badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: #e8f5e9; color: #2e7d32; }
    .stock-badge.out-of-stock { background: #ffebee; color: #c62828; }
    .product-info { display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .price-block { display: flex; align-items: baseline; gap: 16px; }
    .price { font-size: 2rem; font-weight: 700; color: #1976d2; }
    .stock-info { color: #4caf50; font-size: 0.9rem; }
    .description { color: #444; line-height: 1.7; }
    .quantity-selector { display: flex; align-items: center; gap: 8px; border: 1px solid #ddd; border-radius: 8px; padding: 4px 8px; width: fit-content; }
    .qty-input { width: 48px; border: none; text-align: center; font-size: 1.1rem; font-weight: 600; outline: none; }
    .add-to-cart { display: flex; flex-direction: column; gap: 12px; }
    .add-btn { height: 52px; font-size: 1rem; }
    .delivery-info { display: flex; flex-direction: column; gap: 8px; background: #f8f9fa; padding: 16px; border-radius: 8px; }
    .delivery-item { display: flex; align-items: center; gap: 8px; color: #444; font-size: 0.9rem; }
    .delivery-item mat-icon { color: #1976d2; font-size: 20px; width: 20px; height: 20px; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  qty = 1;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe({
      next: (p) => { this.product = p; this.loading = false; },
      error: () => { this.product = null; this.loading = false; }
    });
  }

  decreaseQty(): void { if (this.qty > 1) this.qty--; }
  increaseQty(): void { if (this.product && this.qty < this.product.stock) this.qty++; }

  addToCart(): void {
    if (!this.product) return;
    this.cartService.addToCart(this.product, this.qty);
    this.snackBar.open(this.product.nom + ' x' + this.qty + ' ajouté au panier !', 'OK', { duration: 2000 });
  }
}
