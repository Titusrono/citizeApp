import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteCreateService, CastVoteDto } from '../../../services/vote-create.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProposalComponent implements OnInit {

  proposals: any[] = [];
  voteStatus: { [key: string]: boolean } = {};
  selectedVote: { [key: string]: 'yes' | 'no' } = {};
  reasons: { [key: string]: string } = {};
  userEmail: string = '';
  userId: string = '';
  isSubmitting: boolean = false;

  constructor(
    private voteService: VoteCreateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get authenticated user info
    this.userEmail = localStorage.getItem('user_email') || this.authService.getUserEmail() || '';
    this.userId = localStorage.getItem('user_id') || this.authService.getUserId() || this.userEmail;
    
    if (!this.userId) {
      console.warn('No user ID found. Votes may not be properly tracked.');
    }

    this.fetchProposals();
    this.loadVoteStatus();
  }

  /**
   * Load user's vote status from localStorage
   * Uses a more secure key with user ID hash
   */
  loadVoteStatus(): void {
    const storedVotes = Object.keys(localStorage).filter(key => key.startsWith('vote_'));
    storedVotes.forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const proposalId = parts[1];
        const storedUserId = parts.slice(2).join('_');
        
        if (storedUserId === this.userId || storedUserId === this.userEmail) {
          this.voteStatus[proposalId] = true;
        }
      }
    });
  }

  /**
   * Select a vote option (yes or no)
   */
  selectVote(proposalId: string, vote: 'yes' | 'no'): void {
    this.selectedVote[proposalId] = vote;
    console.log('Vote selected:', { proposalId, vote, selectedVote: this.selectedVote });
  }

  fetchProposals(): void {
    this.voteService.getAllVotes().subscribe({
      next: (data: any[]) => {
        this.proposals = data;
      },
      error: (err: any) => {
        console.error('Error fetching proposals:', err);
        alert('Failed to load proposals. Please try again.');
      }
    });
  }

  /**
   * Submit user's vote with validation and security checks
   */
  submitVote(id: string): void {
    const vote = this.selectedVote[id];
    const voteKey = `vote_${id}_${this.userId}`;

    // Debug logging
    console.log('Submit vote called:', { id, vote, userId: this.userId, selectedVote: this.selectedVote });

    // Validation checks
    if (!this.userId) {
      alert('⚠️ Please log in to vote.');
      return;
    }

    if (!vote) {
      alert('⚠️ Please select Yes or No before submitting.');
      console.warn('No vote selected for proposal:', id);
      return;
    }

    if (localStorage.getItem(voteKey)) {
      alert('⚠️ You have already voted on this proposal.');
      return;
    }

    // Check if proposal is expired
    const proposal = this.proposals.find(p => p._id === id);
    if (proposal && this.isProposalExpired(proposal)) {
      alert('⚠️ This proposal has expired. Voting is closed.');
      return;
    }

    this.isSubmitting = true;

    const payload: CastVoteDto = {
      vote: vote,
      userId: this.userId,
      reason: this.reasons[id]?.trim() || ''
    };

    this.voteService.castVote(id, payload).subscribe({
      next: (response) => {
        // Store vote status securely
        this.voteStatus[id] = true;
        localStorage.setItem(voteKey, JSON.stringify({
          voted: true,
          timestamp: new Date().toISOString(),
          proposalId: id
        }));
        
        // Clear selection and reason
        delete this.selectedVote[id];
        delete this.reasons[id];
        
        // Refresh proposals to show updated counts
        this.fetchProposals();
        this.isSubmitting = false;
        
        // Success notification
        this.showSuccessMessage('✅ Your vote has been recorded successfully!');
      },
      error: (err: any) => {
        console.error('Error submitting vote:', err);
        this.isSubmitting = false;
        
        const errorMsg = err?.error?.message || 'Failed to submit vote. Please try again.';
        alert('❌ ' + errorMsg);
      }
    });
  }

  /**
   * Show success message
   */
  showSuccessMessage(message: string): void {
    // You can replace this with a proper toast notification
    alert(message);
  }

  /**
   * Get total number of votes for a proposal
   */
  getTotalVotes(proposal: any): number {
    return (proposal.yesVotes || 0) + (proposal.noVotes || 0);
  }

  /**
   * Calculate percentage of votes
   */
  getPercentage(votes: number, proposal: any): number {
    const total = this.getTotalVotes(proposal);
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  }

  /**
   * Check if proposal has expired
   */
  isProposalExpired(proposal: any): boolean {
    if (!proposal.endDate) return false;
    return new Date(proposal.endDate) < new Date();
  }

  /**
   * Reset votes for testing (admin only)
   */
  resetVotesForTesting(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('voted_')) localStorage.removeItem(key);
    });
    this.voteStatus = {};
    this.selectedVote = {};
    this.reasons = {};
    alert('All stored votes reset for testing.');
  }
}
