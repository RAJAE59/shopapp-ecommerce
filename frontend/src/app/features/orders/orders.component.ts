// orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="orders-container">
      <h1>Mes Commandes</h1>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <div class="empty" *ngIf="!loading && orders.length === 0">
        <mat-icon>receipt_long</mat-icon>
        <p>Aucune commande pour le moment</p>
        <a mat-raised-button color="primary" routerLink="/catalogue">Commencer mes achats</a>
      </div>

      <mat-accordion *ngIf="!loading && orders.length > 0">
        <mat-expansion-panel *ngFor="let order of orders" class="order-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <div class="order-header">
                <span class="order-id">Commande #{{ order.id }}</span>
                <mat-chip [class]="'status-' + order.statut.toLowerCase()">
                  {{ getStatusLabel(order.statut) }}
                </mat-chip>
              </div>
            </mat-panel-title>
            <mat-panel-description>
              <span>{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              <strong class="order-total">{{ order.total | currency:'EUR' }}</strong>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <!-- Détails de la commande -->
          <div class="order-details">
            <h4>Articles</h4>
            <div class="order-item" *ngFor="let item of order.items">
              <img [src]="item.product?.imageUrl || 'https://via.placeholder.com/50'"
                   [alt]="item.product?.nom" class="item-img">
              <div class="item-info">
                <span class="item-name">{{ item.product?.nom }}</span>
                <span class="item-qty">× {{ item.quantite }}</span>
              </div>
              <span class="item-price">{{ (item.prixUnitaire * item.quantite) | currency:'EUR' }}</span>
            </div>

            <mat-divider></mat-divider>

            <div class="order-footer">
              <div class="delivery-address" *ngIf="order.adresseLivraison">
                <mat-icon>local_shipping</mat-icon>
                <span>{{ order.adresseLivraison }}</span>
              </div>
              <div class="order-total-row">
                <span>Total payé</span>
                <strong>{{ order.total | currency:'EUR' }}</strong>
              </div>
            </div>

            <!-- Timeline statut -->
            <div class="status-timeline">
              <div class="timeline-step" *ngFor="let step of statusSteps"
                   [class.active]="isStepActive(order.statut, step.status)"
                   [class.current]="order.statut === step.status">
                <mat-icon>{{ step.icon }}</mat-icon>
                <span>{{ step.label }}</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .orders-container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; }
    .loading, .empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 0; color: #666; }
    .empty mat-icon { font-size: 72px; width: 72px; height: 72px; color: #ccc; }
    .order-panel { margin-bottom: 12px; }
    .order-header { display: flex; align-items: center; gap: 12px; }
    .order-id { font-weight: 600; }
    mat-panel-description { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .order-total { color: #1976d2; }
    .order-details { padding: 16px 0; }
    .order-details h4 { margin: 0 0 12px; color: #444; }
    .order-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .item-img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .item-info { flex: 1; }
    .item-name { font-weight: 500; }
    .item-qty { color: #666; font-size: 0.9rem; margin-left: 4px; }
    .item-price { font-weight: 600; color: #333; }
    .order-footer { margin-top: 16px; }
    .delivery-address { display: flex; align-items: center; gap: 8px; color: #555; font-size: 0.9rem; padding: 8px 0; }
    .order-total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 1.1rem; }
    .status-timeline { display: flex; justify-content: space-between; margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
    .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.75rem; color: #bbb; flex: 1; }
    .timeline-step mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .timeline-step.active { color: #4caf50; }
    .timeline-step.current { color: #1976d2; font-weight: 700; }
    .status-PENDING { background: #fff3e0; color: #e65100; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-paid { background: #e8f5e9; color: #2e7d32; }
    .status-shipped { background: #f3e5f5; color: #6a1b9a; }
    .status-delivered { background: #e8f5e9; color: #1b5e20; }
    .status-cancelled { background: #ffebee; color: #b71c1c; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  statusSteps = [
    { status: 'PENDING', label: 'Reçue', icon: 'receipt' },
    { status: 'CONFIRMED', label: 'Confirmée', icon: 'check_circle' },
    { status: 'PAID', label: 'Payée', icon: 'payment' },
    { status: 'SHIPPED', label: 'Expédiée', icon: 'local_shipping' },
    { status: 'DELIVERED', label: 'Livrée', icon: 'home' },
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => { this.orders = orders; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmée', PAID: 'Payée',
      SHIPPED: 'Expédiée', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return labels[status] || status;
  }

  isStepActive(currentStatus: string, stepStatus: string): boolean {
    const order = ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'];
    return order.indexOf(currentStatus) >= order.indexOf(stepStatus);
  }
}
