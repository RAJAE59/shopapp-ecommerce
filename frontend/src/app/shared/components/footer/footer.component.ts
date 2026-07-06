// footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="brand-name">🛍️ ShopApp</span>
          <p>Votre boutique en ligne de confiance.</p>
        </div>
        <div class="footer-links">
          <h4>Navigation</h4>
          <a href="/catalogue">Catalogue</a>
          <a href="/cart">Panier</a>
          <a href="/orders">Mes commandes</a>
        </div>
        <div class="footer-tech">
          <h4>Stack technique</h4>
          <span class="tech-badge">Java Spring Boot</span>
          <span class="tech-badge">Angular</span>
          <span class="tech-badge">PostgreSQL</span>
          <span class="tech-badge">Stripe</span>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ year }} ShopApp — Projet portfolio Full Stack</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #1a1a2e; color: #ccc; margin-top: 64px; }
    .footer-content { max-width: 1200px; margin: 0 auto; padding: 40px 16px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 32px; }
    @media (max-width: 600px) { .footer-content { grid-template-columns: 1fr; } }
    .brand-name { font-size: 1.4rem; font-weight: 700; color: white; }
    .footer-brand p { margin-top: 8px; color: #888; font-size: 0.9rem; }
    .footer-links h4, .footer-tech h4 { color: white; margin: 0 0 12px; font-size: 0.95rem; }
    .footer-links { display: flex; flex-direction: column; gap: 8px; }
    .footer-links a { color: #aaa; text-decoration: none; font-size: 0.9rem; }
    .footer-links a:hover { color: white; }
    .footer-tech { display: flex; flex-direction: column; gap: 6px; }
    .tech-badge { background: #2a2a4a; color: #90caf9; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; width: fit-content; }
    .footer-bottom { border-top: 1px solid #333; text-align: center; padding: 16px; font-size: 0.85rem; color: #666; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
