import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { CartItem, Order } from '../../shared/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatStepperModule,
    MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="checkout-container">
      <h1>Finaliser la commande</h1>

      <div class="empty" *ngIf="items.length === 0">
        <p>Votre panier est vide.</p>
        <a mat-raised-button routerLink="/catalogue">Retour au catalogue</a>
      </div>

      <div class="checkout-grid" *ngIf="items.length > 0">
        <div class="checkout-steps">
          <mat-stepper orientation="vertical" [linear]="true" #stepper>

            <mat-step [stepControl]="addressForm" label="Adresse de livraison">
              <form [formGroup]="addressForm">
                <div class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Prénom et Nom</mat-label>
                    <input matInput formControlName="nom">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <input matInput formControlName="adresse">
                  </mat-form-field>
                  <div class="two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Ville</mat-label>
                      <input matInput formControlName="ville">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Code postal</mat-label>
                      <input matInput formControlName="codePostal">
                    </mat-form-field>
                  </div>
                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext [disabled]="addressForm.invalid">
                      Continuer
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>

            <mat-step label="Récapitulatif">
              <div class="step-content">
                <div class="review-item" *ngFor="let item of items">
                  <span>{{ item.product.nom }} x{{ item.quantite }}</span>
                  <span>{{ (item.product.prix * item.quantite) | currency:'MAD' }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="review-item total">
                  <strong>Total</strong>
                  <strong class="total-amount">{{ totalPrice | currency:'MAD' }}</strong>
                </div>
                <div class="step-actions">
                  <button mat-button matStepperPrevious>Retour</button>
                  <button mat-raised-button color="primary" matStepperNext (click)="placeOrder()" [disabled]="orderLoading">
                    <span *ngIf="!orderLoading">Confirmer</span>
                    <span *ngIf="orderLoading">Chargement...</span>
                  </button>
                </div>
              </div>
            </mat-step>

            <mat-step label="Paiement">
              <div class="step-content" *ngIf="createdOrder">
                <div class="stripe-info">
                  <mat-icon>lock</mat-icon>
                  <h3>Paiement sécurisé — Commande #{{ createdOrder.id }}</h3>
                </div>
                <mat-card class="stripe-form">
                  <mat-card-content>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Numéro de carte</mat-label>
                      <input matInput [value]="cardNumber" (input)="onCardInput($event)" placeholder="4242 4242 4242 4242" maxlength="19">
                    </mat-form-field>
                    <div class="two-cols">
                      <mat-form-field appearance="outline">
                        <mat-label>Expiration</mat-label>
                        <input matInput [value]="cardExpiry" (input)="onExpiryInput($event)" placeholder="MM/AA" maxlength="5">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>CVV</mat-label>
                        <input matInput [value]="cardCvv" (input)="onCvvInput($event)" placeholder="123" maxlength="3" type="password">
                      </mat-form-field>
                    </div>
                    <div class="test-card-hint">
                      <mat-icon>info</mat-icon>
                      <span>Carte test : <strong>4242 4242 4242 4242</strong> — 12/26 — 123</span>
                    </div>
                    <button mat-raised-button color="primary" class="pay-btn" (click)="processPayment()" [disabled]="paymentLoading">
                      <span *ngIf="!paymentLoading">Payer {{ createdOrder.total | currency:'MAD' }}</span>
                      <span *ngIf="paymentLoading">Traitement...</span>
                    </button>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-step>
          </mat-stepper>
        </div>

        <mat-card class="order-summary">
          <mat-card-content>
            <h3>Votre commande</h3>
            <div class="summary-item" *ngFor="let item of items">
              <span class="item-name">{{ item.product.nom }}</span>
              <span>x{{ item.quantite }} — {{ (item.product.prix * item.quantite) | currency:'MAD' }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="summary-total">
              <span>Total</span>
              <strong>{{ totalPrice | currency:'MAD' }}</strong>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 24px; }
    .checkout-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } }
    .full-width { width: 100%; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .step-content { padding: 16px 0; display: flex; flex-direction: column; gap: 8px; }
    .step-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .review-item { display: flex; justify-content: space-between; padding: 8px 0; }
    .review-item.total { font-size: 1.1rem; padding-top: 12px; }
    .total-amount { color: #1976d2; }
    .stripe-info { text-align: center; padding: 16px 0; }
    .test-card-hint { display: flex; align-items: center; gap: 8px; background: #e3f2fd; padding: 12px; border-radius: 8px; font-size: 0.85rem; color: #1565c0; margin: 8px 0; }
    .pay-btn { width: 100%; height: 52px; font-size: 1rem; margin-top: 8px; }
    .order-summary { height: fit-content; }
    .summary-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; }
    .summary-total { display: flex; justify-content: space-between; padding-top: 12px; font-size: 1.1rem; }
    .empty { text-align: center; padding: 64px 0; }
  `]
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  addressForm: FormGroup;
  orderLoading = false;
  paymentLoading = false;
  createdOrder: Order | null = null;
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addressForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      codePostal: ['', Validators.required],
      pays: ['France']
    });
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => this.items = items);
  }

  get totalPrice(): number { return this.cartService.totalPrice; }

  onCardInput(event: Event): void {
    this.cardNumber = (event.target as HTMLInputElement).value
      .replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }
  onExpiryInput(event: Event): void { this.cardExpiry = (event.target as HTMLInputElement).value; }
  onCvvInput(event: Event): void { this.cardCvv = (event.target as HTMLInputElement).value; }

  placeOrder(): void {
    if (this.createdOrder) return;
    this.orderLoading = true;
    const { nom, adresse, ville, codePostal, pays } = this.addressForm.value;
    const adresseLivraison = nom + ', ' + adresse + ', ' + codePostal + ' ' + ville + ', ' + pays;
    const orderItems = this.items.map(i => ({ productId: i.product.id, quantite: i.quantite }));
    this.orderService.createOrder(adresseLivraison, orderItems).subscribe({
      next: (order) => { this.createdOrder = order; this.orderLoading = false; },
      error: () => { this.snackBar.open('Erreur commande', 'Fermer', { duration: 3000 }); this.orderLoading = false; }
    });
  }

  processPayment(): void {
    if (!this.createdOrder) return;
    this.paymentLoading = true;
    this.orderService.createPaymentIntent(this.createdOrder.id).subscribe({
      next: () => {
        setTimeout(() => {
          this.paymentLoading = false;
          this.cartService.clearCart();
          this.snackBar.open('Paiement réussi ! 🎉', 'OK', { duration: 4000 });
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: () => { this.snackBar.open('Erreur paiement', 'Fermer', { duration: 3000 }); this.paymentLoading = false; }
    });
  }
}
