import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminVoteCreateService, CreateVoteCreateDto } from '../../services/vote-create.service';
import { VoteCreateFormComponent } from '../form/vote-create-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';

@Component({
  selector: 'app-vote-create-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VoteCreateFormComponent, ConfirmDialogComponent],
  templateUrl: './vote-create-list.component.html',
  styleUrls: ['./vote-create-list.component.scss']
})
export class VoteCreateListComponent implements OnInit {
  proposal: CreateVoteCreateDto = {
    title: '',
    description: '',
    eligibility: '',
    endDate: ''
  };

  proposals: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingProposal: any = null;
  isEditing = false;
  showModal = false;

  // Delete confirmation dialog state
  showDeleteConfirm = false;
  proposalToDelete: any = null;
  isDeleting = false;

  constructor(private voteService: AdminVoteCreateService) {}

  ngOnInit(): void {
    this.fetchProposals();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchProposals() {
    this.voteService.getAllVotes().subscribe({
      next: (data) => {
        this.proposals = data;
      },
      error: (err) => {
        console.error('Error fetching proposals:', err);
        this.errorMessage = 'Could not fetch proposals.';
      }
    });
  }

  onFormSubmit(proposal: CreateVoteCreateDto) {
    if (this.isEditing && this.editingProposal) {
      this.updateProposal();
    } else {
      this.createProposal();
    }
  }

  createProposal() {
    this.voteService.createVote(this.proposal).subscribe({
      next: () => {
        this.successMessage = 'Proposal created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error creating proposal:', err);
        this.errorMessage = err?.error?.message || 'Failed to create proposal.';
        this.successMessage = '';
      }
    });
  }

  updateProposal() {
    if (!this.editingProposal) return;
    const id = this.editingProposal._id;

    this.voteService.updateVote(id, this.proposal).subscribe({
      next: () => {
        this.successMessage = 'Proposal updated successfully!';
        this.errorMessage = '';
        this.editingProposal = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error updating proposal:', err);
        this.errorMessage = err?.error?.message || 'Failed to update proposal.';
        this.successMessage = '';
      }
    });
  }

  onEdit(proposal: any) {
    this.editingProposal = { ...proposal };
    this.proposal = { ...proposal };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string) {
    this.proposalToDelete = { id };
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    const id = this.proposalToDelete.id;
    this.isDeleting = true;

    this.voteService.deleteVote(id).subscribe({
      next: () => {
        this.successMessage = 'Proposal deleted successfully!';
        this.errorMessage = '';
        this.showDeleteConfirm = false;
        this.proposalToDelete = null;
        this.isDeleting = false;
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error deleting proposal:', err);
        this.errorMessage = 'Failed to delete proposal.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onDeleteCancelled() {
    this.showDeleteConfirm = false;
    this.proposalToDelete = null;
  }

  resetForm() {
    this.proposal = {
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
