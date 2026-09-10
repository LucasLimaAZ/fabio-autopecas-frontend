import { Component, output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  readonly menuToggle = output<void>();
  readonly logout = output<void>();
}
