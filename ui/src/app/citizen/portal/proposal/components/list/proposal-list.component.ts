import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { VoteCreateService, CastVoteDto, VoteLevel } from '../../../../../services/vote-create.service';
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
  filteredProposals: any[] = [];
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
  userSubCounty: string = '';
  userWard: string = '';
  submittingVoteId: string | null = null;

  VoteLevel = VoteLevel;

  constructor(
    private voteService: VoteCreateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('user_email') || this.authService.getUserEmail() || '';
    this.userId = localStorage.getItem('user_id') || this.authService.getUserId() || this.userEmail;
    this.userSubCounty = localStorage.getItem('user_subcounty') || '';
    this.userWard = localStorage.getItem('user_ward') || '';
    
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
    // Use the backend-filtered endpoint that returns only votes the user is eligible for
    this.voteService.getEligibleVotes().subscribe({
      next: (data: any[]) => {
        // Backend already filters based on user's location, so just use directly
        this.proposals = data || [];
        this.filteredProposals = this.proposals;
        console.log(`[ProposalList] Loaded ${this.proposals.length} eligible votes for user`);
      },
      error: (err: any) => {
        console.error('Error fetching eligible proposals:', err);
        // Fallback to getAllVotes if authenticated call fails
        this.fallbackToAllVotes();
      }
    });
  }

  fallbackToAllVotes(): void {
    console.warn('[ProposalList] Falling back to getAllVotes with client-side filtering');
    this.voteService.getAllVotes().subscribe({
      next: (data: any[]) => {
        this.proposals = data;
        this.filterProposalsByUserLevel();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load proposals.';
        console.error('Error fetching proposals:', err);
      }
    });
  }

  filterProposalsByUserLevel(): void {
    // This is now mainly a client-side backup since server does the filtering
    // But keep it for the fallback scenario
    this.filteredProposals = this.proposals.filter(proposal => {
      const voteLevel = proposal.voteLevel || VoteLevel.GENERAL;
      
      if (voteLevel === VoteLevel.GENERAL) {
        return true; // All users can see general votes
      }
      
      if (voteLevel === VoteLevel.SUB_COUNTY) {
        return proposal.selectedSubCounties?.includes(this.userSubCounty);
      }
      
      if (voteLevel === VoteLevel.WARD) {
        return proposal.selectedWards?.includes(this.userWard);
      }
      
      return false;
    });
    console.log(`[ProposalList] Filtered to ${this.filteredProposals.length} proposals for user location`);
  }

  isVoteAccessible(proposal: any): boolean {
    const voteLevel = proposal.voteLevel || VoteLevel.GENERAL;
    
    if (voteLevel === VoteLevel.GENERAL) return true;
    if (voteLevel === VoteLevel.SUB_COUNTY) return proposal.selectedSubCounties?.includes(this.userSubCounty);
    if (voteLevel === VoteLevel.WARD) return proposal.selectedWards?.includes(this.userWard);
    
    return false;
  }

  getVoteLevelLabel(voteLevel: string): string {
    switch (voteLevel) {
      case VoteLevel.GENERAL:
        return 'All Users';
      case VoteLevel.SUB_COUNTY:
        return 'Sub-County Level';
      case VoteLevel.WARD:
        return 'Ward Level';
      default:
        return 'General';
    }
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
