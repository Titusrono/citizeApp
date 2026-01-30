import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardSwitcherComponent } from '../../shared/dashboard-switcher/dashboard-switcher.component';

@Component({
  selector: 'app-portal',
  imports: [RouterLink, CommonModule, RouterOutlet, DashboardSwitcherComponent],
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],  // fixed typo from styleUrl to styleUrls
})
export class PortalComponent implements OnInit {
  sidebarOpen = false;
  isBaseDashboardRoute: any;
  userRole: string = '';
  isLoggedIn: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to role stream to reactively capture role after login
    this.authService.getRoleStream().subscribe(role => {
      this.userRole = role ?? '';
    });

    // Determine login status
    this.isLoggedIn = !!this.authService.getToken();

    // Fallback if role not yet set (e.g. on refresh)
    if (!this.userRole) {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) this.userRole = storedRole;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'super_admin';
  }
}
