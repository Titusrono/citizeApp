import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Petition {
  _id?: string;
  title: string;
  description: string;
  targetAuthority: string;
  supportingDocs?: string[];
  status?: string;
  signatures?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetitionService {
  private readonly API_URL = `${environment.apiUrl}/petitions`;

  constructor(private http: HttpClient) {}

  // Get all petitions
  getAllPetitions(): Observable<Petition[]> {
    return this.http.get<Petition[]>(this.API_URL);
  }

  // Create a new petition
  createPetition(petition: Petition): Observable<Petition> {
    return this.http.post<Petition>(this.API_URL, petition);
  }

  // Get a single petition by ID
  getPetitionById(id: string): Observable<Petition> {
    return this.http.get<Petition>(`${this.API_URL}/${id}`);
  }

  // Update a petition
  updatePetition(id: string, petition: Partial<Petition>): Observable<Petition> {
    return this.http.patch<Petition>(`${this.API_URL}/${id}`, petition);
  }

  // Delete a petition
  deletePetition(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
