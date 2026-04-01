import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualMeet, VirtualService } from '../../services/virtual.service';
import { VirtualCreateFormComponent } from '../form/virtual-create-form.component';

@Component({
  selector: 'app-virtual-create-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VirtualCreateFormComponent],
  templateUrl: './virtual-create-list.component.html',
  styleUrls: ['./virtual-create-list.component.scss']
})
export class VirtualCreateListComponent implements OnInit {
  currentData: VirtualMeet = {
    title: '',
    agenda: '',
    date: '',
    meetLink: '',
    recordingLink: '',
    isLive: false
  };

  items: (VirtualMeet & { isUpcoming: boolean; isDone: boolean })[] = [];
  successMessage = '';
  errorMessage = '';
  editingMeeting: any = null;
  isEditing = false;
  showModal = false;

  filter: 'all' | 'upcoming' | 'done' | 'live' = 'all';

  constructor(private virtualService: VirtualService) {
    const now = new Date();
    const defaultDate = now.toISOString().slice(0, 16);
    this.currentData = {
      title: '',
      agenda: '',
      date: defaultDate,
      meetLink: '',
      recordingLink: '',
      isLive: false
    };
  }

  ngOnInit() {
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

  fetchMeetings() {
    const now = new Date();

    this.virtualService.getAllMeetings().subscribe({
      next: data => {
        this.items = data.map(meeting => {
          const meetingDate = new Date(meeting.date);
          const isUpcoming = meetingDate > now;
          const isDone = !isUpcoming;
          return { ...meeting, isUpcoming, isDone };
        }).filter(m => {
          switch (this.filter) {
            case 'upcoming':
              return m.isUpcoming && !m.isLive;
            case 'done':
              return m.isDone && !m.isLive;
            case 'live':
              return m.isLive;
            default:
              return true;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load meetings.';
      }
    });
  }

  setFilter(filter: 'all' | 'upcoming' | 'done' | 'live') {
    this.filter = filter;
    this.fetchMeetings();
  }

  onFormSubmit(meetData: VirtualMeet) {
    if (this.isEditing && this.editingMeeting) {
      this.updateMeeting();
    } else {
      this.createMeeting();
    }
  }

  createMeeting() {
    const isoDate = new Date(this.currentData.date).toISOString();
    const meetData: VirtualMeet = {
      ...this.currentData,
      date: isoDate,
      meetLink: this.currentData.meetLink?.trim() === '' ? undefined : this.currentData.meetLink,
      recordingLink: this.currentData.recordingLink?.trim() === '' ? undefined : this.currentData.recordingLink
    };

    this.virtualService.createMeeting(meetData).subscribe({
      next: () => {
        this.successMessage = 'Meeting created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchMeetings();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to create meeting.';
        this.successMessage = '';
      }
    });
  }

  updateMeeting() {
    if (!this.editingMeeting) return;
    const id = this.editingMeeting._id;
    const isoDate = new Date(this.currentData.date).toISOString();
    const meetData: VirtualMeet = {
      ...this.currentData,
      date: isoDate,
      meetLink: this.currentData.meetLink?.trim() === '' ? undefined : this.currentData.meetLink,
      recordingLink: this.currentData.recordingLink?.trim() === '' ? undefined : this.currentData.recordingLink
    };

    this.virtualService.updateMeeting(id, meetData).subscribe({
      next: () => {
        this.successMessage = 'Meeting updated successfully!';
        this.errorMessage = '';
        this.editingMeeting = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchMeetings();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to update meeting.';
        this.successMessage = '';
      }
    });
  }

  onEdit(meeting: VirtualMeet) {
    this.editingMeeting = { ...meeting };
    this.currentData = { ...meeting };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    this.virtualService.deleteMeeting(id).subscribe({
      next: () => {
        this.successMessage = 'Meeting deleted successfully!';
        this.errorMessage = '';
        this.fetchMeetings();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to delete meeting.';
        this.successMessage = '';
      }
    });
  }

  resetForm() {
    const now = new Date();
    const defaultDate = now.toISOString().slice(0, 16);
    this.currentData = {
      title: '',
      agenda: '',
      date: defaultDate,
      meetLink: '',
      recordingLink: '',
      isLive: false
    };
    this.isEditing = false;
    this.editingMeeting = null;
    this.errorMessage = '';
  }
}
