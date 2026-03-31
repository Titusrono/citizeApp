import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ModeratorService } from '../../services';
import { ModeratorFormComponent } from '../form/moderator-form.component';

@Component({
  selector: 'app-moderator-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModeratorFormComponent],
  templateUrl: './moderator-list.component.html'
})
export class ModeratorListComponent implements OnInit {
  currentData: any = {
    name: '',
    email: '',
    role: 'moderator',
    status: 'active'
  };

  items: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingModerator: any = null;
  isEditing = false;
  showModal = false;

  constructor(private moderatorService: ModeratorService) {}

  ngOnInit(): void {
    this.loadModerators();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  loadModerators(): void {
    this.moderatorService.getAllModerators().subscribe({
      next: (data: any[]) => {
        this.items = data;
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = '❌ Failed to load moderators';
        console.error(err);
      }
    });
  }

  onFormSubmit(moderatorData: any) {
    if (this.isEditing && this.editingModerator) {
      this.updateModerator();
    } else {
      this.createModerator();
    }
  }

  createModerator() {
    this.moderatorService.createModerator(this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Moderator created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.loadModerators();
      },
      error: () => {
        this.errorMessage = '❌ Failed to create moderator.';
        this.successMessage = '';
      }
    });
  }

  updateModerator() {
    if (!this.editingModerator) return;

    this.moderatorService.updateModerator(this.editingModerator._id, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Moderator updated successfully!';
        this.errorMessage = '';
        this.editingModerator = null;
        this.isEditing = false;
        this.closeModal();
        this.loadModerators();
      },
      error: () => {
        this.errorMessage = '❌ Failed to update moderator.';
        this.successMessage = '';
      }
    });
  }

  onEdit(moderator: any) {
    this.editingModerator = { ...moderator };
    this.currentData = { ...moderator };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this moderator?')) return;

    this.moderatorService.deleteModerator(id).subscribe({
      next: () => {
        this.successMessage = '✅ Moderator deleted successfully!';
        this.errorMessage = '';
        this.loadModerators();
      },
      error: () => {
        this.errorMessage = '❌ Failed to delete moderator.';
        this.successMessage = '';
      }
    });
  }

  resetForm() {
    this.currentData = {
      name: '',
      email: '',
      role: 'moderator',
      status: 'active'
    };
    this.isEditing = false;
    this.editingModerator = null;
    this.errorMessage = '';
  }
}
