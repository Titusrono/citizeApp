import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface VirtualMeet {
  id?: string;
  _id?: string; // MongoDB alias
  title: string;
  agenda: string;
  date: string; // ISO string format
  meetLink?: string;
  recordingLink?: string;
  isLive?: boolean;
  upcoming?: boolean;   // ✅ NEW field to indicate if the meeting is upcoming
  isDone?: boolean;     // ✅ NEW field to indicate if the meeting has passed
  countdown?: number;   // Optional for countdown info from backend
}

@Injectable({
  providedIn: 'root'
})
export class VirtualService {
  private readonly API_URL = `${environment.apiUrl}/townhalls`;

  constructor(private http: HttpClient) {}

  // Create a new virtual meeting
  createMeeting(meeting: VirtualMeet): Observable<VirtualMeet> {
    return this.http.post<VirtualMeet>(this.API_URL, meeting);
  }

  // Get all virtual meetings
  getAllMeetings(): Observable<VirtualMeet[]> {
    return this.http.get<VirtualMeet[]>(this.API_URL);
  }

  // Get a single virtual meeting by ID
  getMeetingById(id: string): Observable<VirtualMeet> {
    return this.http.get<VirtualMeet>(`${this.API_URL}/${id}`);
  }

  // Update a virtual meeting partially
  updateMeeting(id: string, meeting: Partial<VirtualMeet>): Observable<VirtualMeet> {
    const url = `${this.API_URL}/${id}`;
    console.log('[VirtualService.updateMeeting] 📡 PATCH request:');
    console.log('[VirtualService.updateMeeting]   URL:', url);
    console.log('[VirtualService.updateMeeting]   ID:', id, '(type:', typeof id + ')');
    console.log('[VirtualService.updateMeeting]   Payload:', JSON.stringify(meeting, null, 2));
    return this.http.patch<VirtualMeet>(url, meeting);
  }

  // Delete a virtual meeting by ID
  deleteMeeting(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
