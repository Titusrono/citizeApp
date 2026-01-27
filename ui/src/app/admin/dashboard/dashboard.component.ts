import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
//import { AuthService } from 'src/app/services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isSidebarOpen = true;
  userRole: string = '';
  isLoggedIn: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to role stream to reactively capture role after login
    this.authService.getRoleStream().subscribe(role => {
      this.userRole = role ?? '';
      console.log('✅ Role from AuthService:', this.userRole);
    });

    // Determine login status
    this.isLoggedIn = !!this.authService.getToken();

    // Fallback if role not yet set (e.g. on refresh)
    if (!this.userRole) {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) this.userRole = storedRole;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isHomeRoute(): boolean {
    return this.router.url === '/dashboard' || this.router.url === '/dashboard/';
  }

  isRootDashboard(): boolean {
    return this.isHomeRoute();
  }
}
