import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/issues`;

  constructor(private http: HttpClient) {}

  // ✅ Submit new report (CREATE using JSON)
  submitReport(payload: {
    description: string;
    location: string;
    category: string;
    images: string[]; // ✅ image URLs
  }): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }

  // ✅ Fetch all reports (READ)
  getReports(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ Delete a report (DELETE)
  deleteReport(reportId: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.apiUrl}/${reportId}`, { headers });
  }

  // ✅ Update a report (PATCH)
  updateReport(reportId: string, updatedData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.patch(`${this.apiUrl}/${reportId}`, updatedData, { headers });
  }
}
