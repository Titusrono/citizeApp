import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersregService } from '../../services/usersreg.service';
import { UsersregFormComponent } from '../form/usersreg-form.component';

@Component({
  selector: 'app-usersreg-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersregFormComponent],
  templateUrl: './usersreg-list.component.html'
})
export class UsersregListComponent implements OnInit {
  currentData: any = {
    email: '',
    username: '',
    phone_no: '',
    subCounty: '',
    ward: ''
  };

  itemsList: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingUser: any = null;
  isEditing = false;
  showModal = false;

  subCounties: string[] = [
    'Tetu',
    'Kieni',
    'Mathira East',
    'Mathira West',
    'Othaya',
    'Mukurweini'
  ];
  selectedSubCounty: string = '';
  subCountyStats: { subCounty: string; count: number; percentage: number }[] = [];

  constructor(private usersregService: UsersregService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.usersregService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.itemsList = data;
        this.calculateSubCountyStats();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to fetch users';
        console.error(err);
      }
    });
  }

  calculateSubCountyStats(): void {
    const total = this.itemsList.length;
    const counts: { [key: string]: number } = {};

    this.subCounties.forEach(sc => (counts[sc] = 0));

    this.itemsList.forEach(user => {
      const sc = user.subCounty;
      if (sc && counts.hasOwnProperty(sc)) {
        counts[sc]++;
      }
    });

    this.subCountyStats = this.subCounties.map(subCounty => {
      const count = counts[subCounty] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { subCounty, count, percentage };
    });
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onFormSubmit(userData: any): void {
    if (this.isEditing && this.editingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    this.usersregService.createUser(this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ User created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchUsers();
      },
      error: () => {
        this.errorMessage = '❌ Failed to create user.';
        this.successMessage = '';
      }
    });
  }

  updateUser(): void {
    if (!this.editingUser) return;

    this.usersregService.updateUser(this.editingUser.email, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ User updated successfully!';
        this.errorMessage = '';
        this.editingUser = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchUsers();
      },
      error: () => {
        this.errorMessage = '❌ Failed to update user.';
        this.successMessage = '';
      }
    });
  }

  onEdit(user: any): void {
    this.editingUser = { ...user };
    this.currentData = { ...user };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(email: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.usersregService.deleteUser(email).subscribe({
      next: () => {
        this.successMessage = '✅ User deleted successfully!';
        this.errorMessage = '';
        this.fetchUsers();
      },
      error: () => {
        this.errorMessage = '❌ Failed to delete user.';
        this.successMessage = '';
      }
    });
  }

  resetForm(): void {
    this.currentData = {
      email: '',
      username: '',
      phone_no: '',
      subCounty: '',
      ward: ''
    };
    this.isEditing = false;
    this.editingUser = null;
    this.errorMessage = '';
  }

  applySubCountyFilter(): void {
    if (!this.selectedSubCounty) {
      this.fetchUsers();
    } else {
      this.usersregService.getAllUsers().subscribe({
        next: (data: any[]) => {
          this.itemsList = data.filter(user =>
            user.subCounty?.toLowerCase() === this.selectedSubCounty.toLowerCase()
          );
        },
        error: (err) => {
          this.errorMessage = 'Failed to filter users';
        }
      });
    }
  }
}
