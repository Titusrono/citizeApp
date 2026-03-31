import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Moderator {
  _id?: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModeratorService {
  private apiUrl = `${environment.apiUrl}/moderators`;

  constructor(private http: HttpClient) {}

  getAllModerators(): Observable<Moderator[]> {
    return this.http.get<Moderator[]>(this.apiUrl);
  }

  getModerator(id: string): Observable<Moderator> {
    return this.http.get<Moderator>(`${this.apiUrl}/${id}`);
  }

  createModerator(moderator: Moderator): Observable<Moderator> {
    return this.http.post<Moderator>(this.apiUrl, moderator);
  }

  updateModerator(id: string, moderator: Moderator): Observable<Moderator> {
    return this.http.patch<Moderator>(`${this.apiUrl}/${id}`, moderator);
  }

  deleteModerator(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
