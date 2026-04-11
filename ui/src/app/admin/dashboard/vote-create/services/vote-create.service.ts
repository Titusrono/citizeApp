import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// Voting levels enum
export enum VoteLevel {
  GENERAL = 'general',
  SUB_COUNTY = 'sub_county',
  WARD = 'ward',
}

// DTO for creating or updating a proposal
export interface CreateVoteCreateDto {
  title: string;
  description: string;
  endDate: string;
  eligibility?: string;
  voteLevel?: VoteLevel;
  selectedSubCounties?: string[];
  selectedWards?: string[];
}

// DTO for casting a vote (userId is handled by backend from authenticated user)
export interface CastVoteDto {
  vote: 'yes' | 'no';
  reason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminVoteCreateService {
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

  // ✅ Get a single voting proposal by ID
  getVoteById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // ✅ Get vote results and audit trail
  getVoteResults(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/results`);
  }

  // ✅ Update a voting proposal by ID
  updateVote(id: string, updateVotecreateDto: CreateVoteCreateDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updateVotecreateDto);
  }

  // ✅ Delete a voting proposal by ID
  deleteVote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Get eligible votes for current user (filtered by user's location)
  getEligibleVotes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/eligible`);
  }

  // ✅ Cast a vote on a proposal by ID
  castVote(id: string, votePayload: CastVoteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/vote`, votePayload);
  }
}
