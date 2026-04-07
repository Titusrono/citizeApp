import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualMeet, VirtualService } from '../../services/virtual.service';

@Component({
  selector: 'app-streaming-live-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streaminglive-list.component.html',
  styleUrls: ['./streaminglive-list.component.scss']
})
export class StreamingLiveListComponent implements OnInit {
  meetings: (VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean })[] = [];
  itemsList: typeof this.meetings = [];
  errorMessage = '';

  loading = false;
  filterType: 'all' | 'upcoming' | 'past' | 'live' = 'all';

  itemsPerPage = 8;
  currentPage = 1;
  
  Math = Math;

  constructor(private virtualService: VirtualService) {}

  ngOnInit(): void {
    this.fetchMeetings();
  }

  fetchMeetings(): void {
    this.loading = true;
    const now = new Date().getTime();

    this.virtualService.getAllMeetings().subscribe({
      next: (data: VirtualMeet[]) => {
        console.log('[StreamingLiveList] ✅ Fetched meetings count:', data.length);
        console.log('[StreamingLiveList] First meeting data:', data[0]);
        
        this.meetings = data
          .map(meet => {
            let meetTime: number;
            try {
              const meetDate = new Date(meet.date);
              if (isNaN(meetDate.getTime())) {
                console.warn('[StreamingLiveList] Invalid date for meeting:', meet.title, meet.date);
                meetTime = 0;
              } else {
                meetTime = meetDate.getTime();
              }
            } catch (e) {
              console.error('[StreamingLiveList] Error parsing date:', meet.date, e);
              meetTime = 0;
            }

            const isLive = !!meet.isLive;
            
            console.log('[StreamingLiveList] Processing meeting:', {
              title: meet.title,
              date: meet.date,
              isLive,
              meetLink: !!meet.meetLink,
              recordingLink: !!meet.recordingLink,
              agenda: meet.agenda?.substring(0, 50) + '...'
            });

            return {
              ...meet,
              isLive: isLive,
              isUpcoming: !isLive && meetTime > now,
              isPast: !isLive && meetTime < now
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log('[StreamingLiveList] 📊 Processed meetings:', this.meetings.length);
        this.applyFilter(this.filterType);
        this.loading = false;
      },
      error: (err) => {
        console.error('[StreamingLiveList] ❌ Error fetching meetings:', err);
        this.errorMessage = 'Failed to load meetings.';
        this.loading = false;
      }
    });
  }

  canJoinMeeting(meeting: VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean }): boolean {
    const canJoin = (meeting.isLive || meeting.isUpcoming) && !!meeting.meetLink;
    console.log('[StreamingLiveList] canJoinMeeting:', meeting.title, '- isLive:', meeting.isLive, 'isUpcoming:', meeting.isUpcoming, 'hasMeetLink:', !!meeting.meetLink, 'result:', canJoin);
    return canJoin;
  }

  hasRecording(meeting: VirtualMeet): boolean {
    return !!meeting.recordingLink && meeting.recordingLink.trim().length > 0;
  }

  viewRecording(recordingLink: string): void {
    if (recordingLink) {
      console.log('[StreamingLiveList] Opening recording:', recordingLink);
      window.open(recordingLink, '_blank');
    }
  }

  joinMeeting(meetLink: string): void {
    if (meetLink) {
      console.log('[StreamingLiveList] Opening meeting:', meetLink);
      window.open(meetLink, '_blank');
    }
  }

  applyFilter(type: 'all' | 'upcoming' | 'past' | 'live'): void {
    this.filterType = type;
    this.currentPage = 1;

    switch (type) {
      case 'upcoming':
        this.itemsList = this.meetings.filter(meet => meet.isUpcoming);
        break;
      case 'past':
        this.itemsList = this.meetings.filter(meet => meet.isPast);
        break;
      case 'live':
        this.itemsList = this.meetings.filter(meet => meet.isLive);
        break;
      case 'all':
      default:
        this.itemsList = [...this.meetings];
        break;
    }
  }

  getStatus(meeting: VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean }): 'Upcoming' | 'Past' | 'Live' {
    if (meeting.isLive) return 'Live';
    if (meeting.isUpcoming) return 'Upcoming';
    return 'Past';
  }

  getCountdown(meeting: VirtualMeet): string {
    if (!meeting.date) return '';
    
    try {
      const now = new Date().getTime();
      const meetDate = new Date(meeting.date);
      
      // Check if date is valid
      if (isNaN(meetDate.getTime())) {
        return '';
      }
      
      const meetTime = meetDate.getTime();
      const diff = meetTime - now;

      if (diff <= 0) return '';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      if (days === 0 && hours === 0 && minutes === 0) return '';

      return `${days}d ${hours}h ${minutes}m left`;
    } catch (e) {
      return '';
    }
  }

  getFormattedDate(date: any): string {
    if (!date) return 'Date not available';
    
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
      }
      return parsedDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Date not available';
    }
  }

  paginatedMeetings() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.itemsList.slice(start, start + this.itemsPerPage);
  }
}

