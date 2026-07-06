// admin-products.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../shared/models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="admin-products-container">
      <div class="page-header">
        <h1>Gestion des Produits</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Annuler' : 'Nouveau produit' }}
        </button>
      </div>

      <!-- Formulaire ajout/édition -->
      <mat-card class="product-form-card" *ngIf="showForm">
        <mat-card-header>
          <mat-card-title>{{ editingProduct ? 'Modifier le produit' : 'Ajouter un produit' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom du produit</mat-label>
                <input matInput formControlName="nom">
                <mat-error>Obligatoire</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Catégorie</mat-label>
                <mat-select formControlName="categoryId">
                  <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.nom }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Prix (€)</mat-label>
                <input matInput type="number" step="0.01" formControlName="prix">
                <mat-icon matSuffix>euro</mat-icon>
                <mat-error>Prix obligatoire</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock">
                <mat-error>Stock obligatoire</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de l'image</mat-label>
                <input matInput formControlName="imageUrl" placeholder="https://...">
                <mat-icon matSuffix>image</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="resetForm()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid || loading">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <span *ngIf="!loading">{{ editingProduct ? 'Enregistrer' : 'Créer le produit' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Table produits -->
      <mat-card class="products-table-card">
        <mat-card-content>
          <div *ngIf="tableLoading" class="loading"><mat-spinner diameter="40"></mat-spinner></div>

          <table mat-table [dataSource]="products" *ngIf="!tableLoading" class="products-table">
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let p">
                <img [src]="p.imageUrl || 'https://via.placeholder.com/50'" [alt]="p.nom" class="table-img">
              </td>
            </ng-container>

            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Produit</th>
              <td mat-cell *matCellDef="let p">
                <strong>{{ p.nom }}</strong>
                <br><small class="category-text">{{ p.category?.nom }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="prix">
              <th mat-header-cell *matHeaderCellDef>Prix</th>
              <td mat-cell *matCellDef="let p">{{ p.prix | currency:'EUR' }}</td>
            </ng-container>

            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let p">
                <span [class]="p.stock < 5 ? 'stock-warning' : 'stock-ok'">{{ p.stock }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let p">
                <span [class]="p.actif ? 'badge-active' : 'badge-inactive'">
                  {{ p.actif ? 'Actif' : 'Inactif' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button color="primary" (click)="editProduct(p)" title="Modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(p)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-products-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .product-form-card { margin-bottom: 24px; }
    .product-form { display: flex; flex-direction: column; gap: 12px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: start; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
    .products-table { width: 100%; }
    .table-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .category-text { color: #888; font-size: 0.8rem; }
    .stock-ok { color: #4caf50; font-weight: 600; }
    .stock-warning { color: #f44336; font-weight: 600; }
    .badge-active { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .badge-inactive { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .loading { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  showForm = false;
  loading = false;
  tableLoading = false;
  editingProduct: Product | null = null;
  displayedColumns = ['image', 'nom', 'prix', 'stock', 'statut', 'actions'];
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      prix: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.productService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadProducts(): void {
    this.tableLoading = true;
    this.productService.getProducts(0, 100).subscribe({
      next: (data) => { this.products = data.content; this.tableLoading = false; },
      error: () => this.tableLoading = false
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.loading = true;
    const { nom, description, prix, stock, imageUrl, categoryId } = this.productForm.value;

    let params = new HttpParams()
      .set('nom', nom).set('description', description || '')
      .set('prix', prix).set('stock', stock)
      .set('categoryId', categoryId);
    if (imageUrl) params = params.set('imageUrl', imageUrl);

    const request$ = this.editingProduct
      ? this.http.put<Product>(`http://localhost:8080/api/products/${this.editingProduct.id}`, null, { params })
      : this.http.post<Product>(`http://localhost:8080/api/products`, null, { params });

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingProduct ? 'Produit modifié !' : 'Produit créé !', 'OK', { duration: 2000 });
        this.resetForm();
        this.loadProducts();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.showForm = true;
    this.productForm.patchValue({
      nom: product.nom,
      description: product.description,
      prix: product.prix,
      stock: product.stock,
      imageUrl: product.imageUrl,
      categoryId: product.category?.id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Supprimer "${product.nom}" ?`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.snackBar.open('Produit supprimé', 'OK', { duration: 2000 });
        this.loadProducts();
      }
    });
  }

  resetForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.loading = false;
    this.productForm.reset();
  }
}
