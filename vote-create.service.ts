import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// DTO for creating or updating a proposal
export interface CreateVoteCreateDto {
  title: string;
  description: string;
  endDate: string;
  eligibility?: string;
}

// DTO for casting a vote (userId is handled by backend from authenticated user)
export interface CastVoteDto {
  vote: 'yes' | 'no';
  reason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoteCreateService {
  private apiUrl = `${environment.apiUrl}/votes`;

  constructor(private http: HttpClient) {}

  // ✅ Create a new voting proposal
  createVote(createVotecreateDto: CreateVoteCreateDto): Observable<any> {
    return this.http.post(this.apiUrl, createVotecreateDto);
  }

  // ✅ Get all voting proposals
  getAllVotes(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ Get eligible votes for the current authenticated user
  // Returns votes with 'hasVoted' flag to indicate if user has already voted
  getEligibleVotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/eligible`);
  }

  // ✅ Get a single voting proposal by ID
  getVoteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // ✅ Update a voting proposal by ID
  updateVote(id: string, updateVotecreateDto: CreateVoteCreateDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updateVotecreateDto);
  }

  // ✅ Delete a voting proposal by ID
  deleteVote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Get vote results for a proposal
  getVoteResults(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/results`);
  }

  // ✅ Cast a vote on a proposal by ID
  // User ID is automatically extracted from the authenticated user on the backend
  castVote(id: string, votePayload: CastVoteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/vote`, votePayload);
  }
}
