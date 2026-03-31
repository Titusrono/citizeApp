// (Removed duplicate misplaced deleteIssue and editIssue methods)
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-realtimereport',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './realtimereport.component.html',
  styleUrls: ['./realtimereport.component.scss']
})
export class RealtimereportComponent implements OnInit {
  issues: any[] = [];
  location: string = '';
  showForm = false;
  selectedCategory: string = '';
  currentPage: number = 1;
  pageSize: number = 6;

  // Modal state
  showModal = false;
  selectedIssue: any = null;

  formData = {
    description: '',
    location: '',
    category: '',
    imageUrls: '' // comma-separated string input (converted to string[])
  };

  private readonly apiBaseUrl = environment.apiUrl;

  ngOnInit() {
    this.fetchIssues();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    const token = localStorage.getItem('access_token');
    const imageArray = this.formData.imageUrls
      .split(',')
      .map(url => url.trim())
      .filter(url => !!url);

    const payload = {
      description: this.formData.description,
      location: this.formData.location || this.location,
      category: this.formData.category,
      images: imageArray,
      createdAt: new Date().toISOString()
    };

    // Debug log to confirm payload
    console.log('Submitting issue payload:', payload);

    fetch(`${this.apiBaseUrl}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (response.ok) {
          this.showPopup("✅ Issue reported successfully!");
          this.formData = { description: '', location: '', category: '', imageUrls: '' };
          this.location = '';
          this.fetchIssues();
          this.showForm = false;
        } else {
          response.json().then(res => {
            this.showPopup(`❌ Failed: ${res.message}`, true);
          });
        }
      })
      .catch(() => {
        this.showPopup("❌ Error while submitting.", true);
      });
  }

  fetchIssues() {
    const token = localStorage.getItem('access_token');
    const fetchOptions: RequestInit = {};
    
    if (token) {
      fetchOptions.headers = {
        Authorization: `Bearer ${token}`
      };
    }
    
    fetch(`${this.apiBaseUrl}/issues`, fetchOptions)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched issues:', data);
        if (Array.isArray(data)) {
          this.issues = [...data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
          console.log('Issues wrapped in data property');
          this.issues = [...data.data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else {
          console.warn('Unexpected issues data format:', data);
          this.issues = [];
        }
      })
      .catch(error => {
        console.error('Error fetching issues:', error);
        this.issues = [];
      });
  }

  fetchLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.reverseGeocode(latitude, longitude);
        },
        () => {
          this.showPopup("❌ Unable to retrieve location.", true);
        }
      );
    } else {
      this.showPopup("❌ Geolocation not supported in this browser.", true);
    }
  }

  reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.location = data.display_name || `${lat}, ${lon}`;
        this.formData.location = this.location;
      })
      .catch(() => {
        this.location = `${lat}, ${lon}`;
        this.formData.location = this.location;
      });
  }

  showPopup(message: string, isError = false) {
    const popup = document.getElementById('popup');
    if (!popup) return;

    popup.innerHTML = message;
    popup.className = `fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 transition transform duration-300 ease-out
      ${isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`;

    popup.classList.remove('hidden');
    popup.classList.add('opacity-100', 'scale-100');

    setTimeout(() => {
      popup.classList.remove('opacity-100', 'scale-100');
      popup.classList.add('hidden');
    }, 3000);
  }

  // Modal handlers
  openModal(issue: any) {
    this.selectedIssue = issue;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedIssue = null;
  }

  get filteredIssues(): any[] {
    return this.selectedCategory
      ? this.issues.filter(issue => issue.category === this.selectedCategory)
      : this.issues;
  }

  paginatedIssues(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredIssues.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredIssues.length / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }
  // Delete an issue
  deleteIssue(issue: any) {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    fetch(`${this.apiBaseUrl}/issues/${issue.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => {
        if (res.ok) {
          this.showPopup('✅ Issue deleted successfully!');
          this.fetchIssues();
        } else {
          this.showPopup('❌ Failed to delete issue.', true);
        }
      })
      .catch(() => this.showPopup('❌ Error deleting issue.', true));
  }

  // Edit an issue (placeholder)
  editIssue(issue: any) {
    this.showPopup('Edit functionality coming soon!', true);
  }
}
