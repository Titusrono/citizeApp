import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { VoteCreateService, CastVoteDto } from '../../../../../services/vote-create.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ProposalViewComponent } from '../view/proposal-view.component';

@Component({
  selector: 'app-proposal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProposalViewComponent],
  templateUrl: './proposal-list.component.html',
  styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {
  proposals: any[] = [];
  successMessage = '';
  errorMessage = '';

  // View Modal
  showViewModal = false;
  viewModalData: any = null;

  // Vote tracking per proposal per user
  voteStatus: { [key: string]: 'yes' | 'no' | null } = {};
  selectedVote: { [key: string]: 'yes' | 'no' } = {};
  reasons: { [key: string]: string } = {};
  userEmail: string = '';
  userId: string = '';
  submittingVoteId: string | null = null;

  constructor(
    private voteService: VoteCreateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('user_email') || this.authService.getUserEmail() || '';
    this.userId = localStorage.getItem('user_id') || this.authService.getUserId() || this.userEmail;
    
    if (!this.userId) {
      console.warn('No user ID found. Votes may not be properly tracked.');
    }

    this.fetchProposals();
    this.loadVoteStatus();
  }

  onView(item: any) {
    this.viewModalData = item;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewModalData = null;
  }

  loadVoteStatus(): void {
    // Load stored votes from localStorage to track if user has already voted
    const storedVotes = Object.keys(localStorage).filter(key => key.startsWith('vote_'));
    storedVotes.forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const proposalId = parts[1];
        const storedUserId = parts.slice(2).join('_');
        
        if (storedUserId === this.userId || storedUserId === this.userEmail) {
          const voteValue = localStorage.getItem(key);
          this.voteStatus[proposalId] = voteValue as 'yes' | 'no' | null;
        }
      }
    });
  }

  selectVote(proposalId: string, vote: 'yes' | 'no'): void {
    this.selectedVote[proposalId] = vote;
  }

  fetchProposals(): void {
    this.voteService.getAllVotes().subscribe({
      next: (data: any[]) => {
        this.proposals = data;
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load proposals.';
        console.error('Error fetching proposals:', err);
      }
    });
  }

  submitVote(id: string): void {
    const vote = this.selectedVote[id];
    const voteKey = `vote_${id}_${this.userId}`;

    if (!this.userId) {
      this.errorMessage = 'Please log in to vote.';
      return;
    }

    if (!vote) {
      this.errorMessage = 'Please select Yes or No before submitting.';
      return;
    }

    this.submittingVoteId = id;
    const castVoteData: CastVoteDto = {
      userId: this.userId,
      vote: vote,
      reason: this.reasons[id] || ''
    };

    this.voteService.castVote(id, castVoteData).subscribe({
      next: () => {
        this.successMessage = `Your vote (${vote.toUpperCase()}) has been recorded!`;
        this.errorMessage = '';
        
        // Store the vote in localStorage for persistence
        localStorage.setItem(voteKey, vote);
        
        // Update voteStatus to disable the button
        this.voteStatus[id] = vote;
        
        // Clear selection
        this.selectedVote[id] = null as any;
        this.reasons[id] = '';
        this.submittingVoteId = null;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error?.error?.message || 'Failed to record your vote. Please try again.';
        this.successMessage = '';
        this.submittingVoteId = null;
      }
    });
  }
}
