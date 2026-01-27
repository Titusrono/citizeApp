import { Component, OnInit } from '@angular/core';
import { VirtualMeet, VirtualService } from '../../../services/virtual.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streaminglive',
  templateUrl: './streaminglive.component.html',
  imports: [CommonModule],
  styleUrls: ['./streaminglive.component.css']
})
export class StreamingliveComponent implements OnInit {
  meetings: (VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean })[] = [];
  filteredMeetings: typeof this.meetings = [];
  loading = false;
  error = '';
  filterType: 'all' | 'upcoming' | 'past' | 'live' = 'all';

  itemsPerPage = 8;
  currentPage = 1;

  constructor(private virtualService: VirtualService) {}

  ngOnInit(): void {
    this.fetchMeetings();
  }

  fetchMeetings() {
    this.loading = true;
    this.error = '';
    const now = new Date().getTime();

    this.virtualService.getAllMeetings().subscribe({
      next: (data: VirtualMeet[]) => {
        this.meetings = data
          .map(meet => {
            const meetTime = new Date(meet.date).getTime();
            const isLive = !!meet.isLive;

            return {
              ...meet,
              isLive: isLive,
              isUpcoming: !isLive && meetTime > now,
              isPast: !isLive && meetTime < now
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.applyFilter(this.filterType);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load meetings.';
        this.loading = false;
      }
    });
  }

  applyFilter(type: 'all' | 'upcoming' | 'past' | 'live') {
    this.filterType = type;
    this.currentPage = 1;

    switch (type) {
      case 'upcoming':
        this.filteredMeetings = this.meetings.filter(meet => meet.isUpcoming);
        break;
      case 'past':
        this.filteredMeetings = this.meetings.filter(meet => meet.isPast);
        break;
      case 'live':
        this.filteredMeetings = this.meetings.filter(meet => meet.isLive);
        break;
      case 'all':
      default:
        this.filteredMeetings = [...this.meetings];
        break;
    }
  }

  getStatus(meeting: VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean }): 'Upcoming' | 'Past' | 'Live' {
    if (meeting.isLive) return 'Live';
    if (meeting.isUpcoming) return 'Upcoming';
    return 'Past';
  }

  getCountdown(meeting: VirtualMeet): string {
    const now = new Date().getTime();
    const meetTime = new Date(meeting.date).getTime();
    const diff = meetTime - now;

    if (diff <= 0) return '';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m left`;
  }

  paginatedMeetings() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMeetings.slice(start, start + this.itemsPerPage);
  }

  totalPages() {
    return Math.ceil(this.filteredMeetings.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
