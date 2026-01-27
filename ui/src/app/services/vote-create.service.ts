import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO for creating or updating a proposal
export interface CreateVoteCreateDto {
  title: string;
  description: string;
  endDate: string;
  eligibility?: string;
}

// DTO for casting a vote
export interface CastVoteDto {
  userId: string;
  vote: 'yes' | 'no';
  reason?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoteCreateService {
  // ✅ Correct base URL that matches your NestJS controller path
  private apiUrl = 'http://localhost:3000/votecreate';

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

  // ✅ Update a voting proposal by ID
  updateVote(id: string, updateVotecreateDto: CreateVoteCreateDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updateVotecreateDto);
  }

  // ✅ Delete a voting proposal by ID
  deleteVote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ Cast a vote on a proposal by ID
  castVote(id: string, votePayload: CastVoteDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/vote`, votePayload);
  }
}
