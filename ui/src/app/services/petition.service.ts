import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private apiUrl = 'http://localhost:3000/petitions'; // ✅ Backend API base URL

  constructor(private http: HttpClient) {}

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

    return this.http.post<any>(this.apiUrl, formData);
  }

  // ✅ Get all petitions (with populated createdBy info)
  getAllPetitions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ✅ Get a single petition by ID
  getPetitionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Update a petition
  updatePetition(id: string, updateData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, updateData);
  }

  // ✅ Delete a petition
  deletePetition(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Optional: Approve petition endpoint (if exists)
  approvePetition(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/approve/${id}`, {});
  }
}
