import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ReportAdminFormComponent } from '../form/report-admin-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';

@Component({
  selector: 'app-report-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportAdminFormComponent, ConfirmDialogComponent],
  templateUrl: './report-admin-list.component.html',
  styleUrls: ['./report-admin-list.component.scss']
})
export class ReportAdminListComponent implements OnInit {
  currentData: any = {
    description: '',
    location: '',
    category: '',
    images: []
  };

  items: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingReport: any = null;
  isEditing = false;
  showModal = false;

  // Delete confirmation dialog state
  showDeleteConfirm = false;
  reportToDelete: any = null;
  isDeleting = false;

  selectedCategory: string = '';
  availableCategories: string[] = [];
  categoryStats: { category: string; count: number; percentage: number }[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.fetchReports();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchReports(): void {
    this.reportService.getReports().subscribe({
      next: (data: any[]) => {
        console.log('Fetched reports:', data);
        console.log('First report structure:', data[0]);
        this.items = data;
        this.availableCategories = [...new Set(data.map(report => report.category).filter(Boolean))];
        this.computeCategoryStats();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load reports.';
        console.error('Error fetching reports:', err);
      }
    });
  }

  computeCategoryStats(): void {
    const categoryMap: Record<string, number> = {};
    const totalReports = this.items.length;

    for (const report of this.items) {
      const cat = report.category;
      if (cat) {
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      }
    }

    this.categoryStats = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
      percentage: totalReports ? parseFloat(((count / totalReports) * 100).toFixed(1)) : 0
    }));
  }

  onFormSubmit(reportData: any) {
    if (this.isEditing && this.editingReport) {
      this.updateReport();
    } else {
      this.createReport();
    }
  }

  createReport() {
    this.reportService.submitReport(this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Report created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = 'Failed to create report.';
        this.successMessage = '';
      }
    });
  }

  updateReport() {
    if (!this.editingReport) return;
    const id = this.editingReport._id;

    this.reportService.updateReport(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Report updated successfully!';
        this.errorMessage = '';
        this.editingReport = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = 'Failed to update report.';
        this.successMessage = '';
      }
    });
  }

  onEdit(report: any) {
    this.editingReport = { ...report };
    this.currentData = { ...report };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onApprove(item: any) {
    console.log('onApprove - Item:', item);
    console.log('onApprove - Item keys:', Object.keys(item));
    console.log('onApprove - Item._id:', item._id);
    console.log('onApprove - Item.id:', item.id);
    const id = item._id || item.id;
    console.log('onApprove - Using ID:', id);
    
    this.reportService.approveReport(id).subscribe({
      next: () => {
        this.successMessage = 'Report approved successfully!';
        this.errorMessage = '';
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = 'Failed to approve report.';
        this.successMessage = '';
      }
    });
  }

  onDelete(item: any) {
    console.log('onDelete - Item:', item);
    this.reportToDelete = item;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    const id = this.reportToDelete._id || this.reportToDelete.id;
    console.log('onDeleteConfirmed - Using ID:', id);
    this.isDeleting = true;

    this.reportService.deleteReport(id).subscribe({
      next: () => {
        this.successMessage = 'Report deleted successfully!';
        this.errorMessage = '';
        this.showDeleteConfirm = false;
        this.reportToDelete = null;
        this.isDeleting = false;
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = 'Failed to delete report.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onDeleteCancelled() {
    this.showDeleteConfirm = false;
    this.reportToDelete = null;
  }

  resetForm() {
    this.currentData = {
      description: '',
      location: '',
      category: '',
      images: []
    };
    this.isEditing = false;
    this.editingReport = null;
    this.errorMessage = '';
  }
}
