import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';

export interface Petition {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  targetAuthority: string;
  supportingDocs?: string[];
  status?: string;
  signatures?: number;
  isApproved?: boolean;
  approvedBy?: any;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private readonly API_URL = `${environment.apiUrl}/petitions`;
  private readonly TOKEN_KEY = 'access_token';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // Get all petitions
  getAllPetitions(): Observable<Petition[]> {
    console.log('[AdminPetitionService] Fetching all petitions with auth token');
    return this.http.get<Petition[]>(this.API_URL, { headers: this.getHeaders() });
  }

  // Create a new petition
  createPetition(petition: Petition): Observable<Petition> {
    console.log('[AdminPetitionService] Creating petition:', petition);
    return this.http.post<Petition>(this.API_URL, petition, { headers: this.getHeaders() });
  }

  // Get a single petition by ID
  getPetitionById(id: string): Observable<Petition> {
    console.log('[AdminPetitionService] Fetching petition by ID:', id);
    return this.http.get<Petition>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  // Update a petition
  updatePetition(id: string, petition: Partial<Petition>): Observable<Petition> {
    console.log('[AdminPetitionService] Updating petition:', id, petition);
    return this.http.patch<Petition>(`${this.API_URL}/${id}`, petition, { headers: this.getHeaders() });
  }

  // Delete a petition
  deletePetition(id: string): Observable<any> {
    console.log('[AdminPetitionService] Deleting petition:', id);
    return this.http.delete(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  // Approve a petition
  approvePetition(id: string): Observable<Petition> {
    console.log('[AdminPetitionService] Approving petition:', id, 'Endpoint:', `${this.API_URL}/${id}/approve`);
    return this.http.post<Petition>(`${this.API_URL}/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  // Reject a petition
  rejectPetition(id: string): Observable<any> {
    console.log('[AdminPetitionService] Rejecting petition:', id, 'Endpoint:', `${this.API_URL}/${id}/reject`);
    return this.http.post<any>(`${this.API_URL}/${id}/reject`, {}, { headers: this.getHeaders() });
  }
}
