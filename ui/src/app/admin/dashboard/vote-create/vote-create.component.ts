import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VoteCreateService,
  CreateVoteCreateDto
} from '../../../services/vote-create.service';

@Component({
  selector: 'app-vote-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-create.component.html',
})
export class VoteCreateComponent implements OnInit {
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

  constructor(private voteService: VoteCreateService) {}

  ngOnInit(): void {
    this.fetchProposals();
  }

  createProposal() {
    this.voteService.createVote(this.proposal).subscribe({
      next: () => {
        this.successMessage = '✅ Proposal created successfully!';
        this.errorMessage = '';
        this.resetForm();
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error creating proposal:', err);
        this.errorMessage = err?.error?.message || '❌ Failed to create proposal.';
        this.successMessage = '';
      }
    });
  }

  fetchProposals() {
    this.voteService.getAllVotes().subscribe({
      next: (data) => {
        this.proposals = data;
      },
      error: (err) => {
        console.error('Error fetching proposals:', err);
        this.errorMessage = '❌ Could not fetch proposals.';
      }
    });
  }

  editProposal(proposal: any) {
    this.editingProposal = { ...proposal };
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProposal() {
    const id = this.editingProposal._id;

    this.voteService.updateVote(id, this.editingProposal).subscribe({
      next: () => {
        this.successMessage = '✅ Proposal updated successfully!';
        this.errorMessage = '';
        this.editingProposal = null;
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error updating proposal:', err);
        this.errorMessage = err?.error?.message || '❌ Failed to update proposal.';
        this.successMessage = '';
      }
    });
  }

  deleteProposal(id: string) {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    this.voteService.deleteVote(id).subscribe({
      next: () => {
        this.successMessage = '✅ Proposal deleted successfully!';
        this.errorMessage = '';
        this.fetchProposals();
      },
      error: (err) => {
        console.error('Error deleting proposal:', err);
        this.errorMessage = '❌ Failed to delete proposal.';
        this.successMessage = '';
      }
    });
  }

  resetForm() {
    this.proposal = {
      title: '',
      description: '',
      eligibility: '',
      endDate: ''
    };
  }
}
