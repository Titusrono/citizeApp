import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-portal',
  imports: [RouterLink, CommonModule, RouterOutlet],
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],  // fixed typo from styleUrl to styleUrls
})
export class PortalComponent {
  sidebarOpen = false;
isBaseDashboardRoute: any;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
