import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-petition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './petition.component.html',
  styleUrls: ['./petition.component.scss']
})
export class PetitionComponent implements OnInit {
  petitionForm: FormGroup;
  selectedFile: File | null = null;
  successMessage: string = '';  // Message to show on success
  errorMessage: string = '';    // Message to show on error
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  showForm: boolean = false;
  petitions: any[] = [];
  currentPage: number = 1;
  pageSize: number = 6;
  showModal: boolean = false;
  selectedPetition: any = null;
  private readonly apiBaseUrl = environment.apiUrl;

  // Authorities array for dropdown
  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.petitionForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      targetAuthority: ['', Validators.required],
      supportingDocs: ['']
    });
  }

  ngOnInit() {
    this.fetchPetitions();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  fetchPetitions() {
    const token = localStorage.getItem('access_token');
    const fetchOptions: RequestInit = {};
    
    if (token) {
      fetchOptions.headers = {
        Authorization: `Bearer ${token}`
      };
    }
    
    fetch(`${this.apiBaseUrl}/petitions`, fetchOptions)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Fetched petitions:', data);
        if (Array.isArray(data)) {
          this.petitions = [...data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
          console.log('Petitions wrapped in data property');
          this.petitions = [...data.data].sort((a, b) => {
            const dateA = new Date(a?.createdAt || 0).getTime();
            const dateB = new Date(b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
        } else {
          console.warn('Unexpected petition data format:', data);
          this.petitions = [];
        }
      })
      .catch(error => {
        console.error('Error fetching petitions:', error);
        this.petitions = [];
      });
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.petitionForm.valid) {
      const formData = new FormData();
      formData.append('title', this.petitionForm.value.title);
      formData.append('description', this.petitionForm.value.description);
      formData.append('targetAuthority', this.petitionForm.value.targetAuthority);
      if (this.selectedFile) {
        formData.append('supportingDocs', this.selectedFile);
      }

      // Get token from local storage
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.errorMessage = 'User not authenticated. Please log in.';
        this.showErrorMessage = true;
        setTimeout(() => this.showErrorMessage = false, 3000);
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.post(`${environment.apiUrl}/petitions`, formData, { headers }).subscribe(
        (res) => {
          this.successMessage = 'Petition Successfully Submitted!';
          this.showSuccessMessage = true;
          this.petitionForm.reset();
          this.selectedFile = null;
          this.fetchPetitions();
          this.showForm = false;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        },
        (err) => {
          console.error(err);
          this.errorMessage = 'Submission Failed! Please try again.';
          this.showErrorMessage = true;
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 3000);
        }
      );
    } else {
      this.errorMessage = 'Please fill in the required fields!';
      this.showErrorMessage = true;
      setTimeout(() => {
        this.showErrorMessage = false;
      }, 3000);
    }
  }

  openModal(petition: any) {
    this.selectedPetition = petition;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPetition = null;
  }

  paginatedPetitions(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.petitions.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.petitions.length / this.pageSize);
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

  deletePetition(petition: any) {
    if (!confirm('Are you sure you want to delete this petition?')) return;
    fetch(`${this.apiBaseUrl}/petitions/${petition.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then(res => {
        if (res.ok) {
          this.fetchPetitions();
        }
      })
      .catch(() => console.error('Error deleting petition.'));
  }
}
