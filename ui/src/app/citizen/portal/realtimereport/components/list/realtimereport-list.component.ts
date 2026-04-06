import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../services/issue.service';
import { RealtimereportFormComponent } from '../form/realtimereport-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';

// Add type annotations for error parameters
declare type ErrorResponse = { error?: { message?: string } };

@Component({
  selector: 'app-realtimereport-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RealtimereportFormComponent, ConfirmDialogComponent],
  templateUrl: './realtimereport-list.component.html',
  styleUrls: ['./realtimereport-list.component.scss']
})
export class RealtimereportListComponent implements OnInit {
  currentData: any = {
    description: '',
    location: '',
    category: '',
    images: []
  };

  // User's own issues
  userIssuesList: any[] = [];
  // Approved issues from other users
  approvedIssuesList: any[] = [];
  // Combined list for backwards compatibility
  itemsList: any[] = [];
  
  successMessage = '';
  errorMessage = '';
  editingIssue: any = null;
  isEditing = false;
  showModal = false;
  isLoading = true;
  Math = Math; // Add Math reference for template

  // Delete confirmation dialog state
  showDeleteConfirm = false;
  issueToDelete: any = null;
  isDeleting = false;

  selectedCategory: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  currentUserId: string | null = null;

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    // Get current user ID from localStorage
    this.currentUserId = localStorage.getItem('user_id');
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
    this.isLoading = true;
    this.errorMessage = '';

    if (!this.currentUserId) {
      this.errorMessage = 'Unable to identify user. Please log in again.';
      this.isLoading = false;
      console.log('No currentUserId found');
      return;
    }

    console.log('Fetching issues for userId:', this.currentUserId);

    // Fetch ALL user's issues (both pending and approved)
    this.issueService.getUserIssues(this.currentUserId).subscribe({
      next: (userIssues: any[]) => {
        console.log('User issues received:', userIssues);
        // Sort by createdAt descending (newest first)
        this.userIssuesList = userIssues.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        console.log('User issues after sort:', this.userIssuesList);

        // Fetch approved issues from OTHER users only
        this.issueService.getApprovedIssues().subscribe({
          next: (approvedIssues: any[]) => {
            console.log('Approved issues received:', approvedIssues);
            // Filter to show only approved issues from OTHER users (not current user)
            this.approvedIssuesList = approvedIssues
              .filter(issue => issue.user?._id !== this.currentUserId && issue.user?.id !== this.currentUserId)
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
              });
            console.log('Approved issues from others:', this.approvedIssuesList);

            // Combine for backwards compatibility 
            this.itemsList = [...this.userIssuesList, ...this.approvedIssuesList];
            this.currentPage = 1; // Reset to first page
            this.isLoading = false;
          },
          error: (error: ErrorResponse) => {
            console.error('Error fetching approved issues:', error);
            this.errorMessage = 'Failed to load approved issues. Please try again.';
            this.isLoading = false;
          }
        });
      },
      error: (error: ErrorResponse) => {
        console.error('Error fetching user issues:', error);
        this.errorMessage = 'Failed to load your issues. Please try again.';
        this.isLoading = false;
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
        this.successMessage = 'Issue reported successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Failed to report issue.';
        this.successMessage = '';
      }
    });
  }

  updateIssue(): void {
    if (!this.editingIssue) return;
    const id = this.editingIssue._id;

    this.issueService.updateIssue(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Issue updated successfully!';
        this.errorMessage = '';
        this.editingIssue = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Failed to update issue.';
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
    this.issueToDelete = { id };
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    const id = this.issueToDelete.id;
    this.isDeleting = true;

    this.issueService.deleteIssue(id).subscribe({
      next: () => {
        this.successMessage = 'Issue deleted successfully!';
        this.errorMessage = '';
        this.showDeleteConfirm = false;
        this.issueToDelete = null;
        this.isDeleting = false;
        this.fetchIssues();
      },
      error: (err: ErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Failed to delete issue.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.issueToDelete = null;
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

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when page size changes
  }
}
