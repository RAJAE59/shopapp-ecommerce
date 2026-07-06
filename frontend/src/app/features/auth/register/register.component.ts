// register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Créer un compte</mat-card-title>
          <mat-card-subtitle>Rejoignez ShopApp aujourd'hui</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom complet</mat-label>
              <input matInput formControlName="nom" placeholder="Jean Dupont">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error>Nom obligatoire</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="votre@email.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email obligatoire</mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Email invalide</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Minimum 6 caractères</mat-hint>
              <mat-error>Mot de passe trop court (min 6 caractères)</mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="registerForm.invalid || loading">
              {{ loading ? 'Inscription...' : 'Créer mon compte' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; padding: 24px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; }
    .login-link { text-align: center; color: #666; }
    .login-link a { color: #1976d2; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;

    const { nom, email, password } = this.registerForm.value;
    this.authService.register(nom, email, password).subscribe({
      next: () => {
        this.snackBar.open('Compte créé avec succès !', 'OK', { duration: 2000 });
        this.router.navigate(['/catalogue']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erreur lors de l\'inscription', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
