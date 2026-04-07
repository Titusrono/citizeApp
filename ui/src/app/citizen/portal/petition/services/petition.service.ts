import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private apiUrl = `${environment.apiUrl}/petitions`;
  private readonly TOKEN_KEY = 'access_token';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // ✅ Create a petition (multipart/form-data with optional file)
  createPetition(petitionData: {
    title: string;
    description: string;
    targetAuthority?: string;
    supportingDocs?: File;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('title', petitionData.title);
    formData.append('description', petitionData.description);

    if (petitionData.targetAuthority) {
      formData.append('targetAuthority', petitionData.targetAuthority);
    }

    if (petitionData.supportingDocs) {
      formData.append('supportingDocs', petitionData.supportingDocs);
    }

    // ⛔ No need to manually append createdBy here;
    // it's handled by the backend using req.user via JWT

    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }

  // ✅ Get all petitions (with populated createdBy info)
  getAllPetitions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // ✅ Get a single petition by ID
  getPetitionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Update a petition
  updatePetition(id: string, updateData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, updateData, { headers: this.getHeaders() });
  }

  // ✅ Delete a petition
  deletePetition(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Optional: Approve petition endpoint (if exists)
  approvePetition(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/approve/${id}`, {}, { headers: this.getHeaders() });
  }
}
