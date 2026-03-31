import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ReportAdminFormComponent } from '../form/report-admin-form.component';

@Component({
  selector: 'app-report-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportAdminFormComponent],
  templateUrl: './report-admin-list.component.html'
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
        this.items = data;
        this.availableCategories = [...new Set(data.map(report => report.category).filter(Boolean))];
        this.computeCategoryStats();
      },
      error: (err) => {
        this.errorMessage = '❌ Failed to load reports.';
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
        this.successMessage = '✅ Report created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = '❌ Failed to create report.';
        this.successMessage = '';
      }
    });
  }

  updateReport() {
    if (!this.editingReport) return;
    const id = this.editingReport._id;

    this.reportService.updateReport(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Report updated successfully!';
        this.errorMessage = '';
        this.editingReport = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = '❌ Failed to update report.';
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

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this report?')) return;

    this.reportService.deleteReport(id).subscribe({
      next: () => {
        this.successMessage = '✅ Report deleted successfully!';
        this.errorMessage = '';
        this.fetchReports();
      },
      error: () => {
        this.errorMessage = '❌ Failed to delete report.';
        this.successMessage = '';
      }
    });
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
