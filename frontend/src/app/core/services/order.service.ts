import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'https://rococo-kulfi-ea4908.netlify.app/api';

  constructor(private http: HttpClient) {}

  createOrder(adresseLivraison: string, items: { productId: number; quantite: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, { adresseLivraison, items });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/me`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createPaymentIntent(orderId: number): Observable<{ clientSecret: string; paymentIntentId: string }> {
    return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/payment-intent`, {});
  }

  // Admin
  getAllOrders(page = 0): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/orders?page=${page}`);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/admin/orders/${id}/status?status=${status}`, {});
  }
}
