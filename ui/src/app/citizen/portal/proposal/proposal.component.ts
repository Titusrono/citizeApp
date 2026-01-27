import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoteCreateService, CastVoteDto } from '../../../services/vote-create.service';

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

  constructor(private voteService: VoteCreateService) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('user_email') || 'guest@example.com';
    this.fetchProposals();

    // Load vote status per user from localStorage
    const storedVotes = Object.keys(localStorage).filter(key => key.startsWith(`voted_`));
    storedVotes.forEach(key => {
      const [_, proposalId, email] = key.split('_');
      if (email === this.userEmail) {
        this.voteStatus[proposalId] = true;
      }
    });
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

  submitVote(id: string): void {
    const vote = this.selectedVote[id];

    const voteKey = `voted_${id}_${this.userEmail}`;

    if (!id || !vote || localStorage.getItem(voteKey)) {
      alert('You have already voted or did not select a vote.');
      return;
    }

    const payload: CastVoteDto = {
      vote: vote,
      userId: this.userEmail,
      reason: this.reasons[id] || ''
    };

    this.voteService.castVote(id, payload).subscribe({
      next: () => {
        this.voteStatus[id] = true;
        localStorage.setItem(voteKey, 'true');
        this.fetchProposals();
        alert('Your vote was submitted successfully!');
      },
      error: (err: any) => {
        console.error('Error submitting vote:', err);
        alert(err?.error?.message || 'Failed to submit vote. Please try again.');
      }
    });
  }

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
