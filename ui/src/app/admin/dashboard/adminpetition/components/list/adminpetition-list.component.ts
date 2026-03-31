import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetitionService } from '../../services/petition.service';
import { AdminPetitionFormComponent } from '../form/adminpetition-form.component';

// Type for error responses
declare type ErrorResponse = { error?: { message?: string } };

@Component({
  selector: 'app-admin-petition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPetitionFormComponent],
  templateUrl: './adminpetition-list.component.html'
})
export class AdminPetitionListComponent implements OnInit {
  currentData: any = {
    title: '',
    description: '',
    targetAuthority: '',
    status: 'pending'
  };

  items: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingPetition: any = null;
  isEditing = false;
  showModal = false;

  selectedAuthority: string = '';
  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  authorityStats: { authority: string; count: number; percentage: number }[] = [];

  constructor(private petitionService: PetitionService) {}

  ngOnInit(): void {
    this.fetchPetitions();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchPetitions(): void {
    this.petitionService.getAllPetitions().subscribe({
      next: (data: any[]) => {
        this.items = data.map((petition: any) => ({
          ...petition,
          createdBy: petition.createdBy || {
            username: 'Unknown',
            email: '-',
            phone_no: '-',
            subCounty: '-',
            ward: '-'
          }
        }));
        this.computeAuthorityStats();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = '❌ Failed to load petitions';
        console.error('Failed to load petitions', err);
      }
    });
  }

  computeAuthorityStats(): void {
    const total = this.items.length;
    const counts: { [key: string]: number } = {};

    this.authorities.forEach(authority => (counts[authority] = 0));

    this.items.forEach(petition => {
      const authority = petition.targetAuthority;
      if (authority && counts.hasOwnProperty(authority)) {
        counts[authority]++;
      }
    });

    this.authorityStats = this.authorities.map(authority => {
      const count = counts[authority] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { authority, count, percentage };
    });
  }

  onFormSubmit(petitionData: any) {
    if (this.isEditing && this.editingPetition) {
      this.updatePetition();
    } else {
      this.createPetition();
    }
  }

  createPetition() {
    this.petitionService.createPetition(this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Petition created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchPetitions();
      },
      error: () => {
        this.errorMessage = '❌ Failed to create petition.';
        this.successMessage = '';
      }
    });
  }

  updatePetition() {
    if (!this.editingPetition) return;
    const id = this.editingPetition._id;

    this.petitionService.updatePetition(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Petition updated successfully!';
        this.errorMessage = '';
        this.editingPetition = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchPetitions();
      },
      error: () => {
        this.errorMessage = '❌ Failed to update petition.';
        this.successMessage = '';
      }
    });
  }

  onEdit(petition: any) {
    this.editingPetition = { ...petition };
    this.currentData = { ...petition };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this petition?')) return;

    this.petitionService.deletePetition(id).subscribe({
      next: () => {
        this.successMessage = '✅ Petition deleted successfully!';
        this.errorMessage = '';
        this.fetchPetitions();
      },
      error: () => {
        this.errorMessage = '❌ Failed to delete petition.';
        this.successMessage = '';
      }
    });
  }

  resetForm() {
    this.currentData = {
      title: '',
      description: '',
      targetAuthority: '',
      status: 'pending'
    };
    this.isEditing = false;
    this.editingPetition = null;
    this.errorMessage = '';
  }

  filterByAuthority(authority: string): void {
    this.selectedAuthority = authority;
  }
}
