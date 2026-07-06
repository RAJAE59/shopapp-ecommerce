// product-card.component.ts
import { Component, Input } from '@angular/core';
import { Product } from '../../models';
import { CartService } from '../../../core/services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-card',
  template: `
    <mat-card class="product-card">
      <img mat-card-image [src]="product.imageUrl || 'assets/no-image.png'" [alt]="product.nom">
      <mat-card-content>
        <mat-chip class="category-chip">{{ product.category?.nom }}</mat-chip>
        <h3>{{ product.nom }}</h3>
        <p class="description">{{ product.description | slice:0:80 }}...</p>
        <div class="price-stock">
          <span class="price">{{ product.prix | currency:'EUR':'symbol':'1.2-2' }}</span>
          <span class="stock" [class.low-stock]="product.stock < 5">
            {{ product.stock > 0 ? 'En stock (' + product.stock + ')' : 'Rupture' }}
          </span>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <a mat-button color="primary" [routerLink]="['/products', product.id]">
          Voir détails
        </a>
        <button mat-raised-button color="primary"
                [disabled]="product.stock === 0"
                (click)="addToCart()">
          <mat-icon>add_shopping_cart</mat-icon>
          Ajouter
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .product-card { height: 100%; display: flex; flex-direction: column; }
    .product-card img { height: 200px; object-fit: cover; }
    mat-card-content { flex: 1; }
    h3 { font-size: 1rem; font-weight: 600; margin: 8px 0; }
    .description { color: #666; font-size: 0.85rem; }
    .price-stock { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .price { font-size: 1.2rem; font-weight: bold; color: #1976d2; }
    .stock { font-size: 0.8rem; color: green; }
    .low-stock { color: orange; }
    .category-chip { font-size: 0.75rem; margin-bottom: 4px; }
    mat-card-actions { display: flex; justify-content: space-between; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(private cartService: CartService, private snackBar: MatSnackBar) {}

  addToCart(): void {
    this.cartService.addToCart(this.product);
    this.snackBar.open(`${this.product.nom} ajouté au panier !`, 'OK', { duration: 2000 });
  }
}
