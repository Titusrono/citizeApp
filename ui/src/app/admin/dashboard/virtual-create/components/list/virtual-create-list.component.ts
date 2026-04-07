import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualMeet, VirtualService } from '../../services/virtual.service';
import { VirtualCreateFormComponent } from '../form/virtual-create-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';

@Component({
  selector: 'app-virtual-create-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VirtualCreateFormComponent, ConfirmDialogComponent],
  templateUrl: './virtual-create-list.component.html',
  styleUrls: ['./virtual-create-list.component.scss']
})
export class VirtualCreateListComponent implements OnInit, AfterViewInit {
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
  isSubmitting = false;

  // Delete confirmation dialog state
  showDeleteConfirm = false;
  meetingToDelete: any = null;
  isDeleting = false;

  filter: 'all' | 'upcoming' | 'done' | 'live' = 'all';

  constructor(private virtualService: VirtualService) {}
  
  ngAfterViewInit() {
    // Initialize default date after view init
    const now = new Date();
    const defaultDate = this.formatDateForInput(now);
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
        console.log('[VirtualCreateList] ✅ Fetched meetings:', data.length);
        
        this.items = data.map(meeting => {
          // Normalize ID: MongoDB returns _id, but we use id
          if (!meeting.id && meeting._id) {
            meeting.id = meeting._id;
          }
          
          const meetingDate = new Date(meeting.date);
          const isUpcoming = meetingDate > now;
          const isDone = !isUpcoming;
          console.log('[VirtualCreateList] Meeting mapped:', { 
            title: meeting.title, 
            id: meeting.id, 
            _id: meeting._id,
            isUpcoming, 
            isDone 
          });
          
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
        
        console.log('[VirtualCreateList] Items after filter:', this.items.length);
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
    console.log('[VirtualCreateList] onFormSubmit called with data:', JSON.stringify(meetData, null, 2));
    if (this.isEditing && this.editingMeeting) {
      console.log('[VirtualCreateList] In edit mode, calling updateMeeting()');
      this.updateMeeting();
    } else {
      console.log('[VirtualCreateList] In create mode, calling createMeeting()');
      this.createMeeting();
    }
  }

  createMeeting() {
    if (this.isSubmitting) return; // Prevent double submission
    this.isSubmitting = true;

    const isoDate = new Date(this.currentData.date).toISOString();
    
    // Only send valid fields to avoid validation errors
    const meetData: VirtualMeet = {
      title: this.currentData.title,
      agenda: this.currentData.agenda,
      date: isoDate,
      meetLink: this.currentData.meetLink?.trim() === '' ? undefined : this.currentData.meetLink,
      recordingLink: this.currentData.recordingLink?.trim() === '' ? undefined : this.currentData.recordingLink,
      isLive: this.currentData.isLive
    };

    console.log('[VirtualCreateList] ➕ Creating new meeting');
    console.log('[VirtualCreateList] Create payload (clean):', JSON.stringify(meetData, null, 2));
    console.log('[VirtualCreateList] Data keys:', Object.keys(meetData));
    console.log('[VirtualCreateList] Sending POST request...');

    this.virtualService.createMeeting(meetData).subscribe({
      next: (response) => {
        console.log('[VirtualCreateList] ✅ Meeting created successfully');
        console.log('[VirtualCreateList] Response from API:', response);
        this.successMessage = 'Meeting created successfully!';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.closeModal();
        this.fetchMeetings();
      },
      error: err => {
        console.error('[VirtualCreateList] ❌ Error creating meeting:', err);
        const errorMsg = this.extractErrorMessage(err);
        this.errorMessage = errorMsg;
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }

  updateMeeting() {
    if (!this.editingMeeting || this.isSubmitting) return; // Prevent double submission
    this.isSubmitting = true;
    
    // Support both _id (MongoDB) and id properties
    const id = this.editingMeeting._id || this.editingMeeting.id;
    
    console.log('[VirtualCreateList] DEBUG updateMeeting:');
    console.log('[VirtualCreateList]   editingMeeting._id:', this.editingMeeting._id);
    console.log('[VirtualCreateList]   editingMeeting.id:', this.editingMeeting.id);
    console.log('[VirtualCreateList]   resolved id:', id);
    console.log('[VirtualCreateList]   id type:', typeof id);
    console.log('[VirtualCreateList]   id === undefined:', id === undefined);
    console.log('[VirtualCreateList]   !!id:', !!id);
    
    if (!id) {
      console.error('[VirtualCreateList] ❌ No ID found in editing meeting:', this.editingMeeting);
      this.errorMessage = 'Error: Unable to identify meeting for update.';
      this.isSubmitting = false;
      return;
    }
    
    const isoDate = new Date(this.currentData.date).toISOString();
    
    // Only send valid fields to avoid validation errors
    const meetData: VirtualMeet = {
      title: this.currentData.title,
      agenda: this.currentData.agenda,
      date: isoDate,
      meetLink: this.currentData.meetLink?.trim() === '' ? undefined : this.currentData.meetLink,
      recordingLink: this.currentData.recordingLink?.trim() === '' ? undefined : this.currentData.recordingLink,
      isLive: this.currentData.isLive
    };

    console.log('[VirtualCreateList] 📝 Updating meeting with ID:', id);
    console.log('[VirtualCreateList] URL will be: /townhalls/' + id);
    console.log('[VirtualCreateList] Update payload (clean):', JSON.stringify(meetData, null, 2));
    console.log('[VirtualCreateList] Data keys:', Object.keys(meetData));
    console.log('[VirtualCreateList] recordingLink value:', meetData.recordingLink);
    console.log('[VirtualCreateList] isLive value:', meetData.isLive);

    this.virtualService.updateMeeting(id, meetData).subscribe({
      next: () => {
        console.log('[VirtualCreateList] ✅ Meeting updated successfully');
        this.successMessage = 'Meeting updated successfully!';
        this.errorMessage = '';
        this.editingMeeting = null;
        this.isEditing = false;
        this.isSubmitting = false;
        this.closeModal();
        this.fetchMeetings();
      },
      error: err => {
        console.error('[VirtualCreateList] ❌ Error updating meeting:', err);
        console.error('[VirtualCreateList] Error response:', err.error);
        const errorMsg = this.extractErrorMessage(err);
        this.errorMessage = errorMsg;
        this.successMessage = '';
        this.isSubmitting = false;
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.message) {
      // Handle array of messages from ValidationPipe
      if (Array.isArray(err.error.message)) {
        return err.error.message.join(', ');
      }
      return err.error.message;
    }
    return 'An error occurred. Please try again.';
  }

  onEdit(meeting: VirtualMeet) {
    console.log('[VirtualCreateList] ✏️ Editing meeting:', meeting);
    const meetingId = meeting._id || meeting.id;
    console.log('[VirtualCreateList] Meeting ID (normalized):', meetingId);
    console.log('[VirtualCreateList] _id:', meeting._id, ' | id:', meeting.id);
    console.log('[VirtualCreateList] Raw date from API:', meeting.date);
    
    this.editingMeeting = { ...meeting };
    // Ensure both id properties are set
    if (!this.editingMeeting.id && meeting._id) {
      this.editingMeeting.id = meeting._id;
    }
    if (!this.editingMeeting._id && meeting.id) {
      this.editingMeeting._id = meeting.id;
    }
    
    // Format date for datetime-local input (expects YYYY-MM-DDTHH:mm format)
    const meetingDate = new Date(meeting.date);
    const formattedDate = this.formatDateForInput(meetingDate);
    
    this.currentData = {
      ...meeting,
      id: meetingId,
      _id: meetingId,
      date: formattedDate
    };
    
    console.log('[VirtualCreateList] Formatted date for input:', formattedDate);
    console.log('[VirtualCreateList] Complete currentData prepared:', {
      title: this.currentData.title,
      agenda: this.currentData.agenda,
      date: this.currentData.date,
      meetLink: this.currentData.meetLink,
      recordingLink: this.currentData.recordingLink,
      isLive: this.currentData.isLive,
      id: this.currentData.id,
      _id: this.currentData._id
    });
    
    this.isEditing = true;
    this.isSubmitting = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
    
    console.log('[VirtualCreateList] ✅ Edit mode activated, modal opened');
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onDelete(id: string) {
    this.meetingToDelete = { id };
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    const id = this.meetingToDelete.id;
    this.isDeleting = true;

    this.virtualService.deleteMeeting(id).subscribe({
      next: () => {
        this.successMessage = 'Meeting deleted successfully!';
        this.errorMessage = '';
        this.showDeleteConfirm = false;
        this.meetingToDelete = null;
        this.isDeleting = false;
        this.fetchMeetings();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Failed to delete meeting.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onDeleteCancelled() {
    this.showDeleteConfirm = false;
    this.meetingToDelete = null;
  }

  resetForm() {
    const now = new Date();
    const defaultDate = this.formatDateForInput(now);
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
    this.isSubmitting = false;
    this.errorMessage = '';
  }
}
