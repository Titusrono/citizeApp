import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteCreateService } from '../../../../../services/vote-create.service';

@Component({
  selector: 'app-vote-cast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-cast.component.html',
  styleUrls: ['./vote-cast.component.scss']
})
export class VoteCastComponent {
  @Input() vote: any;
  @Output() close = new EventEmitter<void>();
  @Output() voteCast = new EventEmitter<void>();

  voteValue: 'yes' | 'no' | null = null;
  reason = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private voteService: VoteCreateService
  ) {}

  selectVote(value: 'yes' | 'no'): void {
    this.voteValue = value;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.voteValue) {
      this.errorMessage = 'Please select Yes or No to cast your vote.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Create payload without userId - backend extracts user from JWT token
    const castVotePayload = {
      vote: this.voteValue,
      ...(this.reason && { reason: this.reason })
    };

    this.voteService.castVote(this.vote._id || this.vote.id, castVotePayload).subscribe({
      next: () => {
        this.successMessage = 'Your vote has been recorded successfully!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.voteCast.emit();
          this.onClose();
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error casting vote:', err);
        this.errorMessage = err?.error?.message || 'Failed to cast your vote. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
