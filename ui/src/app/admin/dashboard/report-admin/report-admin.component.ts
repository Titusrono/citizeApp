import { Component, OnInit, TrackByFunction } from '@angular/core';
import { ReportService } from '../../../services/report.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-admin',
  templateUrl: './report-admin.component.html',
  styleUrls: ['./report-admin.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ReportAdminComponent implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  paginatedReports: any[] = [];

  isLoading: boolean = false;
  editingReport: any = null;
  imageUrlString: string = '';

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;

  selectedCategory: string = '';
  availableCategories: string[] = [];
  categoryStats: { category: string; count: number; percentage: number }[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.fetchReports();
  }

  fetchReports(): void {
    this.isLoading = true;
    this.reportService.getReports().subscribe({
      next: (data: any[]) => {
        this.reports = data;
        this.availableCategories = [...new Set(data.map(report => report.category).filter(Boolean))];
        this.computeCategoryStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.isLoading = false;
      }
    });
  }

  computeCategoryStats(): void {
    const categoryMap: Record<string, number> = {};
    const totalReports = this.reports.length;

    for (const report of this.reports) {
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

  applyFilters(): void {
    const filtered = this.selectedCategory
      ? this.reports.filter(r => r.category === this.selectedCategory)
      : [...this.reports];

    this.filteredReports = filtered;
    this.totalPages = Math.ceil(this.filteredReports.length / this.pageSize);
    this.paginate();
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedReports = this.filteredReports.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.applyFilters();
  }

  deleteReport(reportId: string): void {
    const confirmed = confirm('Are you sure you want to delete this report?');
    if (!confirmed) return;

    this.isLoading = true;
    this.reportService.deleteReport(reportId).subscribe({
      next: () => {
        this.fetchReports();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting report:', err);
        this.isLoading = false;
      }
    });
  }

  editReport(report: any): void {
    this.editingReport = { ...report };
    this.imageUrlString = Array.isArray(report.images) ? report.images.join(', ') : '';
  }

  saveEdit(): void {
    if (!this.editingReport || !this.editingReport._id) return;

    const cleanedImages = this.imageUrlString
      .split(',')
      .map(url => url.trim())
      .filter(url => !!url);

    const updatedData = {
      ...this.editingReport,
      images: cleanedImages
    };

    this.isLoading = true;
    this.reportService.updateReport(this.editingReport._id, updatedData).subscribe({
      next: () => {
        this.fetchReports();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating report:', err);
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingReport = null;
    this.imageUrlString = '';
    this.isLoading = false;
  }

  getImageUrls(urlString: string): string[] {
    return urlString
      .split(',')
      .map(url => url.trim())
      .filter(url => !!url);
  }

  trackById: TrackByFunction<any> = (index, item) => item._id;
}
