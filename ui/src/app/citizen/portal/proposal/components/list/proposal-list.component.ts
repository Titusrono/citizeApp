import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class ProposalListComponent implements OnInit, OnDestroy {
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

  // Vote results tracking for real-time display
  voteResults: { [key: string]: any } = {};
  resultsPollingIntervals: { [key: string]: any } = {};

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
    // Load stored votes from localStorage ONLY for current logged-in user
    // Use a more robust key pattern to avoid conflicts between users
    
    if (!this.userId) {
      console.warn('[ProposalList] User ID not available - cannot load vote status');
      return;
    }

    console.log('[ProposalList] Loading vote status for user:', this.userId);
    
    // Get the user-specific vote storage key
    const userVotePrefix = `votes_${this.userId}_`;
    const storedVotes = Object.keys(localStorage).filter(key => key.startsWith(userVotePrefix));
    
    console.log('[ProposalList] Found', storedVotes.length, 'stored votes for current user');
    
    storedVotes.forEach(key => {
      // Extract proposal ID from key like "votes_userId_proposalId"
      const proposalId = key.substring(userVotePrefix.length);
      const voteValue = localStorage.getItem(key);
      
      console.log('[ProposalList] Loaded vote for proposal', proposalId, ':', voteValue);
      this.voteStatus[proposalId] = voteValue as 'yes' | 'no' | null;
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
        
        // Update vote status from the hasVoted flag in backend response
        this.proposals.forEach(proposal => {
          const proposalId = proposal._id || proposal.id;
          // Use hasVoted from backend, fallback to localStorage for backward compatibility
          if (proposal.hasVoted) {
            this.voteStatus[proposalId] = localStorage.getItem(`votes_${this.userId}_${proposalId}`) as 'yes' | 'no' || 'yes'; // default to yes if voted but status not in storage
          }
        });
        
        // Load vote results for all proposals
        this.loadAllProposalResults();
      },
      error: (err: any) => {
        console.error('Error fetching eligible proposals:', err);
        // Fallback to getAllVotes if authenticated call fails
        this.fallbackToAllVotes();
      }
    });
  }

  loadAllProposalResults(): void {
    // Load results for all proposals and start polling
    this.proposals.forEach(proposal => {
      const proposalId = proposal._id || proposal.id;
      this.loadProposalResults(proposalId);
      this.startResultsPolling(proposalId);
    });
  }

  loadProposalResults(proposalId: string): void {
    this.voteService.getVoteResults(proposalId).subscribe({
      next: (results: any) => {
        this.voteResults[proposalId] = results;
        console.log(`[ProposalList] Loaded results for proposal ${proposalId}:`, results);
      },
      error: (err: any) => {
        console.warn(`Failed to load results for proposal ${proposalId}:`, err);
        // Initialize with empty results if endpoint not available
        this.voteResults[proposalId] = {
          results: { yesCount: 0, noCount: 0, yesPercentage: 0, noPercentage: 0, totalVotes: 0 }
        };
      }
    });
  }

  startResultsPolling(proposalId: string, intervalSeconds: number = 5): void {
    // Clear existing interval if any
    if (this.resultsPollingIntervals[proposalId]) {
      clearInterval(this.resultsPollingIntervals[proposalId]);
    }

    // Poll every 5 seconds for vote results updates
    this.resultsPollingIntervals[proposalId] = setInterval(() => {
      this.loadProposalResults(proposalId);
    }, intervalSeconds * 1000);

    console.log(`[ProposalList] Started polling results for proposal ${proposalId}`);
  }

  stopResultsPolling(proposalId: string): void {
    if (this.resultsPollingIntervals[proposalId]) {
      clearInterval(this.resultsPollingIntervals[proposalId]);
      delete this.resultsPollingIntervals[proposalId];
      console.log(`[ProposalList] Stopped polling results for proposal ${proposalId}`);
    }
  }

  ngOnDestroy(): void {
    // Clean up all polling intervals when component is destroyed
    Object.keys(this.resultsPollingIntervals).forEach(proposalId => {
      this.stopResultsPolling(proposalId);
    });
    console.log('[ProposalList] Component destroyed, all polling intervals cleaned up');
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
    const proposal = this.proposals.find(p => (p._id || p.id) === id);
    
    // New key format: votes_{userId}_{proposalId}
    // This ensures complete isolation between users
    const voteKey = `votes_${this.userId}_${id}`;

    if (!this.userId) {
      this.errorMessage = 'Please log in to vote.';
      console.warn('[ProposalList] submitVote: No user ID available');
      return;
    }

    // Check if user has already voted (from backend hasVoted flag)
    if (proposal?.hasVoted) {
      this.errorMessage = 'You have already voted on this proposal. One vote per proposal per user is allowed.';
      console.warn('[ProposalList] submitVote: User already voted on this proposal');
      return;
    }

    if (!vote) {
      this.errorMessage = 'Please select Yes or No before submitting.';
      return;
    }

    this.submittingVoteId = id;
    
    console.log('[ProposalList] Submitting vote for proposal', id, 'with vote:', vote);
    console.log('[ProposalList] Will store in localStorage with key:', voteKey);

    const castVoteData: CastVoteDto = {
      vote: vote,
      reason: this.reasons[id] || ''
    };

    this.voteService.castVote(id, castVoteData).subscribe({
      next: () => {
        console.log('[ProposalList] ✅ Vote recorded successfully for proposal:', id);
        this.successMessage = `Your vote (${vote.toUpperCase()}) has been recorded!`;
        this.errorMessage = '';
        
        // Update the hasVoted flag in the proposal object
        if (proposal) {
          proposal.hasVoted = true;
        }
        
        // Store the vote in localStorage with new format for complete user isolation
        localStorage.setItem(voteKey, vote);
        console.log('[ProposalList] ✅ Vote stored in localStorage');
        
        // Update voteStatus to disable the button
        this.voteStatus[id] = vote;
        
        // Clear selection
        this.selectedVote[id] = null as any;
        this.reasons[id] = '';
        this.submittingVoteId = null;
      },
      error: (error: HttpErrorResponse) => {
        console.error('[ProposalList] ❌ Error submitting vote:', error);
        console.error('[ProposalList] Error details:', error?.error);
        this.errorMessage = error?.error?.message || 'Failed to record your vote. Please try again.';
        this.successMessage = '';
        this.submittingVoteId = null;
      }
    });
  }
}
