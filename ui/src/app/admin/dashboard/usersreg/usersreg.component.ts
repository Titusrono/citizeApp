import { Component, OnInit } from '@angular/core';
import { UsersregService } from '../../../services/usersreg.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usersreg',
  templateUrl: './usersreg.component.html',
  styleUrls: ['./usersreg.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UsersregComponent implements OnInit {
  users: any[] = [];              // Filtered list for display
  allUsers: any[] = [];           // Full unfiltered list
  subCounties: string[] = [       // Available sub-counties
    'Tetu',
    'Kieni',
    'Mathira East',
    'Mathira West',
    'Othaya',
    'Mukurweini'
  ];
  selectedSubCounty: string = '';

  loading = false;
  errorMessage = '';
  editUser: any = null;

  // 🆕 Holds calculated stats
  subCountyStats: { subCounty: string; count: number; percentage: number }[] = [];

  constructor(private usersregService: UsersregService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.usersregService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.allUsers = data;
        this.users = [...data]; // Show all by default
        this.calculateSubCountyStats(); // 🆕 calculate stats after fetch
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to fetch users';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applySubCountyFilter(): void {
    if (!this.selectedSubCounty) {
      this.users = [...this.allUsers]; // Show all if none selected
    } else {
      this.users = this.allUsers.filter(user =>
        user.subCounty?.toLowerCase() === this.selectedSubCounty.toLowerCase()
      );
    }
  }

  startEdit(user: any): void {
    this.editUser = { ...user }; // Clone to avoid live changes
  }

  cancelEdit(): void {
    this.editUser = null;
  }

  saveEdit(): void {
    if (!this.editUser) return;

    this.usersregService.updateUser(this.editUser.email, this.editUser).subscribe({
      next: (response: { message: string; user: any }) => {
        const updatedUser = response.user;
        const index = this.allUsers.findIndex(u => u.email === updatedUser.email);
        if (index !== -1) {
          this.allUsers[index] = updatedUser;
          this.applySubCountyFilter(); // Re-apply filter after update
          this.calculateSubCountyStats(); // 🆕 Recalculate stats
        }
        this.editUser = null;
      },
      error: (err: any) => {
        alert('Failed to update user');
        console.error(err);
      }
    });
  }

  deleteUser(email: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.usersregService.deleteUser(email).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u.email !== email);
        this.applySubCountyFilter(); // Refresh filtered list
        this.calculateSubCountyStats(); // 🆕 Recalculate stats
      },
      error: (err: any) => {
        alert('Failed to delete user');
        console.error(err);
      }
    });
  }

  // 🧠 New logic to calculate percentage per subcounty
  calculateSubCountyStats(): void {
    const subCountyCountMap: { [key: string]: number } = {};
    const totalUsers = this.allUsers.length;

    this.allUsers.forEach(user => {
      const key = user.subCounty || 'Unknown';
      subCountyCountMap[key] = (subCountyCountMap[key] || 0) + 1;
    });

    this.subCountyStats = Object.entries(subCountyCountMap).map(([subCounty, count]) => ({
      subCounty,
      count,
      percentage: Math.round((count / totalUsers) * 100)
    }));
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
