import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteCreateService } from '../../../../../services/vote-create.service';

@Component({
  selector: 'app-vote-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './vote-list.component.html',
  styleUrls: ['./vote-list.component.scss']
})
export class VoteListComponent implements OnInit {
  eligibleVotes: any[] = [];
  filteredVotes: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  selectedVote: any = null;
  showCastModal = false;

  // Vote results state
  showResultsModal = false;
  voteResults: any = null;
  resultsLoading = false;

  // Vote casting state
  voteValue: 'yes' | 'no' | null = null;
  reason = '';
  isSubmitting = false;

  // Filter options
  statusFilter = 'all'; // all, active, ended

  constructor(
    private voteService: VoteCreateService
  ) {}

  ngOnInit(): void {
    this.loadEligibleVotes();
  }

  loadEligibleVotes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Fetch eligible votes from the endpoint that includes 'hasVoted' flag
    this.voteService.getEligibleVotes().subscribe({
      next: (votes: any[]) => {
        console.log('Loaded eligible votes:', votes);
        this.eligibleVotes = votes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading eligible votes:', err);
        this.errorMessage = err?.error?.message || 'Failed to load eligible votes.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.eligibleVotes];

    // Filter by status
    const now = new Date();
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(vote => new Date(vote.endDate) > now);
    } else if (this.statusFilter === 'ended') {
      filtered = filtered.filter(vote => new Date(vote.endDate) <= now);
    }

    this.filteredVotes = filtered;
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  getLevelDisplayName(level: string): string {
    const levels: { [key: string]: string } = {
      'general': 'Countywide Vote',
      'sub_county': 'Sub-County Vote',
      'ward': 'Ward Vote'
    };
    return levels[level] || level;
  }

  getLevelColor(level: string): string {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'sub_county': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'ward': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }

  isVoteActive(vote: any): boolean {
    return new Date(vote.endDate) > new Date();
  }

  getTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Voting Ended';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h remaining`;
    return `${diffHours}h remaining`;
  }

  openCastModal(vote: any): void {
    this.selectedVote = vote;
    this.showCastModal = true;
  }

  closeCastModal(): void {
    this.showCastModal = false;
    this.selectedVote = null;
    this.voteValue = null;
    this.reason = '';
    this.errorMessage = '';
  }

  selectVote(value: 'yes' | 'no'): void {
    this.voteValue = value;
    this.errorMessage = '';
  }

  submitVote(): void {
    if (!this.voteValue) {
      this.errorMessage = 'Please select Yes or No to cast your vote.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const castVotePayload = {
      vote: this.voteValue,
      ...(this.reason && { reason: this.reason })
    };

    this.voteService.castVote(this.selectedVote._id || this.selectedVote.id, castVotePayload).subscribe({
      next: () => {
        this.successMessage = 'Your vote has been recorded successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.closeCastModal();
          this.loadEligibleVotes();
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error casting vote:', err);
        this.errorMessage = err?.error?.message || 'Failed to cast your vote. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onVoteCast(): void {
    this.successMessage = 'Your vote has been recorded successfully!';
    this.closeCastModal();
    this.loadEligibleVotes();
  }

  viewVoteResults(vote: any): void {
    const voteId = vote._id || vote.id;
    if (!voteId) {
      this.errorMessage = 'Unable to load vote results. Vote ID is missing.';
      return;
    }

    this.resultsLoading = true;
    this.errorMessage = '';

    this.voteService.getVoteResults(voteId).subscribe({
      next: (results: any) => {
        console.log('[VoteListComponent] Vote results loaded:', results?.title);
        this.voteResults = results;
        this.showResultsModal = true;
        this.resultsLoading = false;
      },
      error: (err: any) => {
        console.error('[VoteListComponent] Error loading results:', err);
        this.errorMessage = err?.error?.message || 'Failed to load vote results.';
        this.resultsLoading = false;
      }
    });
  }

  closeResultsModal(): void {
    this.showResultsModal = false;
    this.voteResults = null;
  }
}
