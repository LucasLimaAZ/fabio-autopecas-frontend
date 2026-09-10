import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-wrapper-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './wrapper-layout.html',
  styleUrl: './wrapper-layout.scss',
})
export class WrapperLayout {
  sidebarOpen = true;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
