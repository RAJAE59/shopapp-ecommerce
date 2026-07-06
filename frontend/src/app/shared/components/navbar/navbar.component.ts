// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  cartItemCount$!: Observable<number>;
  isLoggedIn = false;
  isAdmin = false;
  userName = '';

  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'ADMIN';
      this.userName = user?.nom ?? '';
    });
  }

  get cartCount(): number {
    return this.cartService.totalItems;
  }

  logout(): void {
    this.authService.logout();
  }
}
