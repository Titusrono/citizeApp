import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  formData = {
    description: '',
    location: '',
    category: '',
    imageUrls: '' // comma-separated string input (converted to string[])
  };

  private readonly apiBaseUrl = 'http://localhost:3000';

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
      images: imageArray
    };

    fetch(`${this.apiBaseUrl}/report`, {
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
    fetch(`${this.apiBaseUrl}/report`)
      .then(res => res.json())
      .then(data => {
        this.issues = data;
      })
      .catch(() => {
        console.error('Error fetching issues.');
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
}
