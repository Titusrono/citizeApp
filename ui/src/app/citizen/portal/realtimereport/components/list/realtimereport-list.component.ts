import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../services/issue.service';
import { RealtimereportFormComponent } from '../form/realtimereport-form.component';

// Add type annotations for error parameters
declare type ErrorResponse = { error?: { message?: string } };

@Component({
  selector: 'app-realtimereport-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RealtimereportFormComponent],
  templateUrl: './realtimereport-list.component.html'
})
export class RealtimereportListComponent implements OnInit {
  currentData: any = {
    description: '',
    location: '',
    category: '',
    images: []
  };

  itemsList: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingIssue: any = null;
  isEditing = false;
  showModal = false;

  selectedCategory: string = '';
  currentPage: number = 1;
  pageSize: number = 6;

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.fetchIssues();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchIssues(): void {
    this.issueService.getAllIssues().subscribe({
      next: (data: any[]) => {
        this.itemsList = data;
      },
      error: (error: ErrorResponse) => {
        this.errorMessage = '❌ Failed to load issues.';
        console.error('Error fetching issues:', error);
      }
    });
  }

  onFormSubmit(issueData: any): void {
    if (this.isEditing && this.editingIssue) {
      this.updateIssue();
    } else {
      this.createIssue();
    }
  }

  createIssue(): void {
    this.issueService.createIssue(this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Issue reported successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || '❌ Failed to report issue.';
        this.successMessage = '';
      }
    });
  }

  updateIssue(): void {
    if (!this.editingIssue) return;
    const id = this.editingIssue._id;

    this.issueService.updateIssue(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Issue updated successfully!';
        this.errorMessage = '';
        this.editingIssue = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || '❌ Failed to update issue.';
        this.successMessage = '';
      }
    });
  }

  onEdit(issue: any): void {
    this.editingIssue = { ...issue };
    this.currentData = { ...issue };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    this.issueService.deleteIssue(id).subscribe({
      next: () => {
        this.successMessage = '✅ Issue deleted successfully!';
        this.errorMessage = '';
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || '❌ Failed to delete issue.';
        this.successMessage = '';
      }
    });
  }

  resetForm(): void {
    this.currentData = {
      description: '',
      location: '',
      category: '',
      images: []
    };
    this.isEditing = false;
    this.editingIssue = null;
    this.errorMessage = '';
  }

  getFilteredIssues() {
    if (!this.selectedCategory) {
      return this.itemsList;
    }
    return this.itemsList.filter(issue => issue.category === this.selectedCategory);
  }

  getPaginatedIssues() {
    const filtered = this.getFilteredIssues();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.getFilteredIssues().length / this.pageSize);
  }
}
