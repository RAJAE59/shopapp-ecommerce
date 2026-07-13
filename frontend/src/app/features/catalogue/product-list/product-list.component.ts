// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../shared/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="catalogue-container">
      <!-- Header -->
      <div class="catalogue-header">
        <h1>Notre Catalogue</h1>
        <p>Découvrez nos {{ totalProducts }} produits</p>
      </div>

      <!-- Filtres -->
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Rechercher</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="iPhone, T-shirt...">
          <button mat-icon-button matSuffix (click)="onSearch()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Catégorie</mat-label>
          <mat-select [(ngModel)]="selectedCategory" (selectionChange)="onCategoryChange()">
            <mat-option [value]="null">Toutes</mat-option>
            <mat-option *ngFor="let cat of categories" [value]="cat.id">
              {{ cat.nom }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="clearFilters()" *ngIf="searchQuery || selectedCategory">
          <mat-icon>clear</mat-icon> Effacer
        </button>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Grille produits -->
      <div class="products-grid" *ngIf="!loading">
        <mat-card class="product-card" *ngFor="let product of products">
          <img mat-card-image
               [src]="product.imageUrl || 'https://via.placeholder.com/300x200?text=' + product.nom"
               [alt]="product.nom">
          <mat-card-content>
            <span class="category-badge">{{ product.category?.nom }}</span>
            <h3>{{ product.nom }}</h3>
            <p class="description">{{ product.description | slice:0:80 }}...</p>
            <div class="price-row">
              <span class="price">{{ product.prix | currency:'MAD' }}</span>
              <span class="stock" [class.out]="product.stock === 0">
                {{ product.stock > 0 ? product.stock + ' en stock' : 'Rupture' }}
              </span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button [routerLink]="['/products', product.id]">Détails</a>
            <button mat-raised-button color="primary"
                    [disabled]="product.stock === 0"
                    (click)="addToCart(product)">
              <mat-icon>add_shopping_cart</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Aucun résultat -->
      <div class="no-results" *ngIf="!loading && products.length === 0">
        <mat-icon>search_off</mat-icon>
        <p>Aucun produit trouvé</p>
        <button mat-button (click)="clearFilters()">Voir tous les produits</button>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="totalProducts > 0"
        [length]="totalProducts"
        [pageSize]="pageSize"
        [pageSizeOptions]="[6, 12, 24]"
        (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .catalogue-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    .catalogue-header { text-align: center; margin-bottom: 32px; }
    .catalogue-header h1 { font-size: 2rem; font-weight: 700; margin: 0; }
    .catalogue-header p { color: #666; margin-top: 4px; }
    .filters { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 24px; }
    .filters mat-form-field { flex: 1; min-width: 200px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .product-card { display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .product-card img { height: 200px; object-fit: cover; }
    mat-card-content { flex: 1; padding-top: 12px; }
    .category-badge { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }
    h3 { margin: 8px 0 4px; font-size: 1rem; font-weight: 600; }
    .description { color: #666; font-size: 0.85rem; line-height: 1.4; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .price { font-size: 1.25rem; font-weight: 700; color: #1976d2; }
    .stock { font-size: 0.8rem; color: #4caf50; }
    .stock.out { color: #f44336; }
    mat-card-actions { display: flex; justify-content: space-between; padding: 8px 16px; }
    .loading, .no-results { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 0; color: #666; }
    .no-results mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  totalProducts = 0;
  pageSize = 12;
  currentPage = 0;
  searchQuery = '';
  selectedCategory: number | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(
      this.currentPage, this.pageSize,
      this.selectedCategory ?? undefined,
      this.searchQuery || undefined
    ).subscribe({
      next: (data) => {
        this.products = data.content;
        this.totalProducts = data.totalElements;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCategory = null;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.searchQuery = '';
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.currentPage = 0;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open(`${product.nom} ajouté au panier !`, 'OK', { duration: 2000 });
  }
}
