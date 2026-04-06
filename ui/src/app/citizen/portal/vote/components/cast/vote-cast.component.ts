import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteCreateService } from '../../../../../services/vote-create.service';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-vote-cast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-cast.component.html',
  styleUrls: ['./vote-cast.component.scss']
})
export class VoteCastComponent implements OnInit {
  @Input() vote: any;
  @Output() close = new EventEmitter<void>();
  @Output() voteCast = new EventEmitter<void>();

  voteValue: 'yes' | 'no' | null = null;
  reason = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;

  constructor(
    private voteService: VoteCreateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      },
      error: (err: any) => {
        console.error('Error getting current user:', err);
      }
    });
  }

  selectVote(value: 'yes' | 'no'): void {
    this.voteValue = value;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.voteValue) {
      this.errorMessage = 'Please select Yes or No to cast your vote.';
      return;
    }

    if (!this.currentUser?.id) {
      this.errorMessage = 'Unable to determine your user ID. Please log in again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const castVotePayload = {
      userId: this.currentUser.id,
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
