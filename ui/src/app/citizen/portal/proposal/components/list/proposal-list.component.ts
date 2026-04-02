import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { VoteCreateService, CastVoteDto } from '../../../../../services/vote-create.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ProposalFormComponent } from '../form/proposal-form.component';
import { ProposalViewComponent } from '../view/proposal-view.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';

@Component({
  selector: 'app-proposal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProposalFormComponent, ProposalViewComponent, ConfirmDialogComponent],
  templateUrl: './proposal-list.component.html',
  styleUrls: ['./proposal-list.component.scss']
})
export class ProposalListComponent implements OnInit {
  proposals: any[] = [];
  successMessage = '';
  errorMessage = '';

  currentData: any = {
    title: '',
    description: '',
    eligibility: '',
    endDate: ''
  };
  editingProposal: any = null;
  isEditing = false;
  showModal = false;

  // View Modal
  showViewModal = false;
  viewModalData: any = null;

  // Confirm Dialog
  showConfirmDialog = false;
  pendingDeleteId: string | null = null;
  isDeleting = false;

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
    this.userEmail = localStorage.getItem('user_email') || this.authService.getUserEmail() || '';
    this.userId = localStorage.getItem('user_id') || this.authService.getUserId() || this.userEmail;
    
    if (!this.userId) {
      console.warn('No user ID found. Votes may not be properly tracked.');
    }

    this.fetchProposals();
    this.loadVoteStatus();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onView(item: any) {
    this.viewModalData = item;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewModalData = null;
  }

  onDelete(id: string) {
    this.pendingDeleteId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete() {
    if (this.pendingDeleteId) {
      this.isDeleting = true;
      this.voteService.deleteVote(this.pendingDeleteId).subscribe({
        next: () => {
          this.successMessage = 'Proposal deleted successfully.';
          this.proposals = this.proposals.filter(p => p.id !== this.pendingDeleteId && p._id !== this.pendingDeleteId);
          this.closeConfirmDialog();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete proposal.';
          console.error(err);
          this.closeConfirmDialog();
        }
      });
    }
  }

  onCancelDelete() {
    this.closeConfirmDialog();
  }

  private closeConfirmDialog() {
    this.showConfirmDialog = false;
    this.pendingDeleteId = null;
    this.isDeleting = false;
  }

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
        this.errorMessage = 'Failed to load proposals.';
        console.error('Error fetching proposals:', err);
        alert('Failed to load proposals. Please try again.');
      }
    });
  }

  submitVote(id: string): void {
    const vote = this.selectedVote[id];
    const voteKey = `vote_${id}_${this.userId}`;

    console.log('Submit vote called:', { id, vote, userId: this.userId, selectedVote: this.selectedVote });

    if (!this.userId) {
      alert('Please log in to vote.');
      return;
    }

    if (!vote) {
      alert('Please select Yes or No before submitting.');
      console.warn('No vote selected for proposal:', id);
      return;
    }

    this.isSubmitting = true;
    const castVoteData: CastVoteDto = {
      userId: this.userId,
      vote: vote,
      reason: this.reasons[id] || ''
    };

    this.voteService.castVote(id, castVoteData).subscribe({
      next: () => {
        this.successMessage = `Your vote (${vote.toUpperCase()}) has been recorded!`;
        this.errorMessage = '';
        localStorage.setItem(voteKey, vote);
        this.voteStatus[id] = true;
        this.selectedVote[id] = null as any;
        this.reasons[id] = '';
        this.isSubmitting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Failed to record your vote. Please try again.';
        this.successMessage = '';
        console.error('Error casting vote:', error);
        this.isSubmitting = false;
      }
    });
  }

  onFormSubmit(proposalData: any) {
    if (this.isEditing && this.editingProposal) {
      this.updateProposal();
    } else {
      this.createProposal();
    }
  }

  createProposal() {
    this.voteService.createVote(this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Proposal created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchProposals();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Failed to create proposal.';
        this.successMessage = '';
      }
    });
  }

  updateProposal() {
    if (!this.editingProposal) return;

    this.voteService.updateVote(this.editingProposal._id, this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Proposal updated successfully!';
        this.errorMessage = '';
        this.editingProposal = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchProposals();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Failed to update proposal.';
        this.successMessage = '';
      }
    });
  }

  onEdit(proposal: any) {
    this.editingProposal = { ...proposal };
    this.currentData = { ...proposal };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  resetForm() {
    this.currentData = {
      title: '',
      description: '',
      eligibility: '',
      endDate: ''
    };
    this.isEditing = false;
    this.editingProposal = null;
    this.errorMessage = '';
  }
}
