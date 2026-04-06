import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminVoteCreateService } from '../../services/vote-create.service';

@Component({
  selector: 'app-vote-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vote-results.component.html',
  styleUrls: ['./vote-results.component.scss']
})
export class VoteResultsComponent implements OnInit {
  voteResults: any = null;
  isLoading = true;
  errorMessage = '';
  voteId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voteService: AdminVoteCreateService
  ) {}

  ngOnInit(): void {
    this.voteId = this.route.snapshot.paramMap.get('id') || '';
    if (this.voteId) {
      this.loadVoteResults();
    }
  }

  loadVoteResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.voteService.getVoteResults(this.voteId).subscribe({
      next: (results) => {
        this.voteResults = results;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading vote results:', err);
        this.errorMessage = err?.error?.message || 'Failed to load vote results.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/votes']);
  }

  downloadAuditTrail(): void {
    if (!this.voteResults?.auditTrail) return;

    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vote-audit-${this.voteResults.id}-${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Timestamp', 'Username', 'Email', 'Ward', 'Sub-County', 'Vote', 'Reason'];
    const rows = this.voteResults.auditTrail.map((entry: any) => [
      new Date(entry.timestamp).toLocaleString(),
      entry.username,
      entry.email,
      entry.ward,
      entry.subCounty,
      entry.voteValue.toUpperCase(),
      entry.reason || ''
    ]);

    const csvRows = [headers, ...rows]
      .map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    return csvRows;
  }

  getLevelDisplayName(level: string): string {
    const levels: { [key: string]: string } = {
      'general': 'Countywide Vote',
      'sub_county': 'Sub-County Vote',
      'ward': 'Ward Vote'
    };
    return levels[level] || level;
  }
}
