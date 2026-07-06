// admin-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSelectModule, MatFormFieldModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <div class="admin-orders-container">
      <div class="page-header">
        <h1>Gestion des Commandes</h1>
        <span class="order-count">{{ orders.length }} commandes</span>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>

      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="orders" class="orders-table">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let o"><strong>#{{ o.id }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>Client</th>
              <td mat-cell *matCellDef="let o">
                <span>{{ o.user?.nom }}</span><br>
                <small class="email">{{ o.user?.email }}</small>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="articles">
              <th mat-header-cell *matHeaderCellDef>Articles</th>
              <td mat-cell *matCellDef="let o">
                <span *ngFor="let item of o.items?.slice(0,2)" class="article-tag">
                  {{ item.product?.nom }} ×{{ item.quantite }}
                </span>
                <span *ngIf="o.items?.length > 2" class="more">+{{ o.items.length - 2 }} autres</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let o">
                <strong class="total">{{ o.total | currency:'EUR' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="statut">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let o">
                <mat-select [(ngModel)]="o.statut" (selectionChange)="updateStatus(o)"
                            class="status-select" [ngClass]="'status-' + o.statut">
                  <mat-option value="PENDING">En attente</mat-option>
                  <mat-option value="CONFIRMED">Confirmée</mat-option>
                  <mat-option value="PAID">Payée</mat-option>
                  <mat-option value="SHIPPED">Expédiée</mat-option>
                  <mat-option value="DELIVERED">Livrée</mat-option>
                  <mat-option value="CANCELLED">Annulée</mat-option>
                </mat-select>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="order-row"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-orders-container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .order-count { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-weight: 600; }
    .loading { display: flex; justify-content: center; padding: 64px; }
    .orders-table { width: 100%; }
    .email { color: #888; font-size: 0.8rem; }
    .total { color: #1976d2; font-size: 1.05rem; }
    .article-tag { display: inline-block; background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 0.78rem; margin: 2px; }
    .more { color: #888; font-size: 0.8rem; }
    .status-select { min-width: 140px; }
    .order-row:hover { background: #fafafa; }
    .status-select.status-PENDING { color: #e65100; }
    .status-select.status-CONFIRMED { color: #1565c0; }
    .status-select.status-PAID { color: #2e7d32; }
    .status-select.status-SHIPPED { color: #6a1b9a; }
    .status-select.status-DELIVERED { color: #1b5e20; }
    .status-select.status-CANCELLED { color: #b71c1c; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  displayedColumns = ['id', 'client', 'date', 'articles', 'total', 'statut'];

  constructor(private orderService: OrderService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => { this.orders = data.content || data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  updateStatus(order: Order): void {
    this.orderService.updateOrderStatus(order.id, order.statut).subscribe({
      next: () => this.snackBar.open(`Commande #${order.id} mise à jour`, 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 })
    });
  }
}
