import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
