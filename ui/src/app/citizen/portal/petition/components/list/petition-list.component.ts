import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetitionService } from '../../services/petition.service';
import { PetitionFormComponent } from '../form/petition-form.component';
import { ConfirmDialogComponent, ViewModalComponent } from '../../../../../shared/components';

@Component({
  selector: 'app-petition-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PetitionFormComponent,
    ConfirmDialogComponent,
    ViewModalComponent
  ],
  templateUrl: './petition-list.component.html',
  styleUrls: ['./petition-list.component.scss']
})
export class PetitionListComponent implements OnInit {
  currentData: any = {
    title: '',
    description: '',
    category: '',
    targetAuthority: '',
    supportingDocs: ''
  };

  items: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  editingPetition: any = null;
  isEditing = false;
  showModal = false;

  // Confirm dialog state
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteId: string | null = null;
  isDeleting = false;

  // View modal state
  showViewModal = false;
  viewModalTitle = '';
  viewModalData: any = {};
  viewModalFields: any[] = [];

  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  currentPage: number = 1;
  pageSize: number = 6;

  constructor(private petitionService: PetitionService) {}

  ngOnInit() {
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

  fetchPetitions() {
    this.petitionService.getAllPetitions().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.items = [...data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
          this.items = [...data.data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else {
          console.warn('Unexpected petition data format:', data);
          this.items = [];
        }
      },
      error: (error) => {
        console.error('Error fetching petitions:', error);
        this.errorMessage = 'Failed to load petitions.';
        this.items = [];
      }
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
        this.successMessage = 'Petition created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchPetitions();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to create petition.';
        this.successMessage = '';
      }
    });
  }

  updatePetition() {
    if (!this.editingPetition) return;
    const id = this.editingPetition._id;

    this.petitionService.updatePetition(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Petition updated successfully!';
        this.errorMessage = '';
        this.editingPetition = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchPetitions();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update petition.';
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
    this.pendingDeleteId = id;
    this.confirmDialogTitle = 'Delete Petition';
    this.confirmDialogMessage = 'Are you sure you want to delete this petition? This action cannot be undone.';
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.pendingDeleteId) return;

    this.isDeleting = true;
    const id = this.pendingDeleteId;

    this.petitionService.deletePetition(id).subscribe({
      next: () => {
        this.successMessage = 'Petition deleted successfully!';
        this.errorMessage = '';
        this.showConfirmDialog = false;
        this.pendingDeleteId = null;
        this.isDeleting = false;
        this.fetchPetitions();
      },
      error: () => {
        this.errorMessage = 'Failed to delete petition.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteId = null;
  }

  onView(petition: any): void {
    this.viewModalTitle = petition.title || 'Petition Details';
    this.viewModalData = petition;
    this.viewModalFields = [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', type: 'longtext' },
      { key: 'category', label: 'Category' },
      { key: 'targetAuthority', label: 'Target Authority' },
      {
        key: 'createdAt',
        label: 'Created Date',
        type: 'date'
      },
      {
        key: 'updatedAt',
        label: 'Updated Date',
        type: 'date'
      }
    ];
    this.showViewModal = true;
  }

  onCloseViewModal(): void {
    this.showViewModal = false;
  }

  resetForm() {
    this.currentData = {
      title: '',
      description: '',
      category: '',
      targetAuthority: '',
      supportingDocs: ''
    };
    this.isEditing = false;
    this.editingPetition = null;
    this.errorMessage = '';
  }
}
