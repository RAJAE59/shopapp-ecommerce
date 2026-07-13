// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard Admin</h1>
        <p>Bienvenue dans votre espace d'administration</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card revenue">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>euro</mat-icon></div>
            <div class="stat-info">
              <h3>{{ stats.totalRevenue | currency:'EUR' }}</h3>
              <p>Chiffre d'affaires</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card orders">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>receipt_long</mat-icon></div>
            <div class="stat-info">
              <h3>{{ stats.totalOrders }}</h3>
              <p>Commandes totales</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card users">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>people</mat-icon></div>
            <div class="stat-info">
              <h3>{{ stats.totalUsers }}</h3>
              <p>Utilisateurs inscrits</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card products">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>inventory_2</mat-icon></div>
            <div class="stat-info">
              <h3>{{ stats.totalProducts }}</h3>
              <p>Produits actifs</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="!stats">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <a mat-raised-button color="primary" routerLink="/admin/products">
            <mat-icon>add</mat-icon> Ajouter un produit
          </a>
          <a mat-raised-button routerLink="/admin/orders">
            <mat-icon>receipt_long</mat-icon> Gérer les commandes
          </a>
          <a mat-raised-button routerLink="/catalogue">
            <mat-icon>store</mat-icon> Voir le catalogue
          </a>
        </div>
      </div>

      <!-- Alertes stock faible -->
      <mat-card class="low-stock-card" *ngIf="lowStockProducts.length > 0">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">warning</mat-icon>
          <mat-card-title>⚠️ Stock faible ({{ lowStockProducts.length }} produits)</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="low-stock-item" *ngFor="let p of lowStockProducts">
            <span>{{ p.nom }}</span>
            <span class="stock-badge" [class.critical]="p.stock === 0">
              {{ p.stock === 0 ? 'RUPTURE' : p.stock + ' restants' }}
            </span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    .dashboard-header { margin-bottom: 32px; }
    .dashboard-header h1 { font-size: 2rem; font-weight: 700; margin: 0; }
    .dashboard-header p { color: #666; margin-top: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    .stat-info h3 { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .stat-info p { color: #666; margin: 4px 0 0; font-size: 0.9rem; }
    .stat-card.revenue .stat-icon { background: linear-gradient(135deg, #1976d2, #42a5f5); }
    .stat-card.orders .stat-icon { background: linear-gradient(135deg, #e91e63, #f48fb1); }
    .stat-card.users .stat-icon { background: linear-gradient(135deg, #4caf50, #81c784); }
    .stat-card.products .stat-icon { background: linear-gradient(135deg, #ff9800, #ffcc02); }
    .loading { display: flex; justify-content: center; padding: 48px; }
    .quick-actions { margin-bottom: 32px; }
    .quick-actions h2 { font-size: 1.3rem; margin-bottom: 16px; }
    .actions-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .low-stock-card { border-left: 4px solid #ff9800; }
    .low-stock-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .stock-badge { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
    .stock-badge.critical { background: #ffebee; color: #c62828; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: Stats | null = null;
  lowStockProducts: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Stats>('https://app-99525641-4e5f-4149-87c2-05d9cad21b16.cleverapps.io/api/admin/stats').subscribe(s => this.stats = s);
    this.http.get<any[]>('https://app-99525641-4e5f-4149-87c2-05d9cad21b16.cleverapps.io/api/admin/products/low-stock').subscribe(p => this.lowStockProducts = p);
  }
}
