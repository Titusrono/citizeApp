import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualMeet, VirtualService } from '../../services/virtual.service';
import { StreamingLiveFormComponent } from '../form/streaminglive-form.component';

@Component({
  selector: 'app-streaming-live-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StreamingLiveFormComponent],
  templateUrl: './streaminglive-list.component.html'
})
export class StreamingLiveListComponent implements OnInit {
  meetings: (VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean })[] = [];
  itemsList: typeof this.meetings = [];
  successMessage = '';
  errorMessage = '';
  editingMeeting: any = null;
  isEditing = false;
  showModal = false;

  loading = false;
  filterType: 'all' | 'upcoming' | 'past' | 'live' = 'all';

  itemsPerPage = 8;
  currentPage = 1;
  
  Math = Math;

  currentData: VirtualMeet = {
    title: '',
    agenda: '',
    date: '',
    meetLink: '',
    recordingLink: '',
    isLive: false
  };

  constructor(private virtualService: VirtualService) {}

  ngOnInit(): void {
    this.fetchMeetings();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchMeetings(): void {
    this.loading = true;
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
        this.errorMessage = '❌ Failed to load meetings.';
        this.loading = false;
      }
    });
  }

  onFormSubmit(meetingData: VirtualMeet): void {
    if (this.isEditing && this.editingMeeting) {
      this.updateMeeting();
    } else {
      this.createMeeting();
    }
  }

  createMeeting(): void {
    this.virtualService.createMeeting(this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Meeting created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchMeetings();
      },
      error: () => {
        this.errorMessage = '❌ Failed to create meeting.';
        this.successMessage = '';
      }
    });
  }

  updateMeeting(): void {
    if (!this.editingMeeting) return;

    this.virtualService.updateMeeting(this.editingMeeting._id, this.currentData).subscribe({
      next: () => {
        this.successMessage = '✅ Meeting updated successfully!';
        this.errorMessage = '';
        this.editingMeeting = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchMeetings();
      },
      error: () => {
        this.errorMessage = '❌ Failed to update meeting.';
        this.successMessage = '';
      }
    });
  }

  onEdit(meeting: VirtualMeet & { isUpcoming: boolean; isPast: boolean; isLive: boolean }): void {
    this.editingMeeting = { ...meeting };
    this.currentData = { ...meeting };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string): void {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    this.virtualService.deleteMeeting(id).subscribe({
      next: () => {
        this.successMessage = '✅ Meeting deleted successfully!';
        this.errorMessage = '';
        this.fetchMeetings();
      },
      error: () => {
        this.errorMessage = '❌ Failed to delete meeting.';
        this.successMessage = '';
      }
    });
  }

  resetForm(): void {
    const now = new Date().toISOString().slice(0, 16);
    this.currentData = {
      title: '',
      agenda: '',
      date: now,
      meetLink: '',
      recordingLink: '',
      isLive: false
    };
    this.isEditing = false;
    this.editingMeeting = null;
    this.errorMessage = '';
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
    return this.itemsList.slice(start, start + this.itemsPerPage);
  }
}

