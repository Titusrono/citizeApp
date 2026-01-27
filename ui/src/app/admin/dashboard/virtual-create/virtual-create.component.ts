import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VirtualMeet, VirtualService } from '../../../services/virtual.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-create',
  templateUrl: './virtual-create.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./virtual-create.component.scss']
})
export class VirtualCreateComponent implements OnInit {
  meetings: (VirtualMeet & { isUpcoming: boolean; isDone: boolean })[] = [];
  form: FormGroup;
  editingId: string | null = null;
  loading = false;
  error = '';
  showForm = false;

  filter: 'all' | 'upcoming' | 'done' | 'live' = 'all';

  constructor(private virtualService: VirtualService, private fb: FormBuilder) {
    const now = new Date();
    const defaultDate = now.toISOString().slice(0, 16);

    this.form = this.fb.group({
      title: ['', Validators.required],
      agenda: ['', Validators.required],
      date: [defaultDate, Validators.required],
      meetLink: ['', Validators.pattern(/https?:\/\/.+/)], // ✅ Optional: no required validator
      recordingLink: ['', Validators.pattern(/https?:\/\/.+/)],
      isLive: [false]
    });
  }

  ngOnInit() {
    this.loadMeetings();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  loadMeetings() {
    this.loading = true;
    const now = new Date();

    this.virtualService.getAllMeetings().subscribe({
      next: data => {
        this.meetings = data.map(meeting => {
          const meetingDate = new Date(meeting.date);
          const isUpcoming = meetingDate > now;
          const isDone = !isUpcoming;
          return { ...meeting, isUpcoming, isDone };
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load meetings.';
        this.loading = false;
      }
    });
  }

  getFilteredMeetings() {
    switch (this.filter) {
      case 'upcoming':
        return this.meetings.filter(m => m.isUpcoming && !m.isLive);
      case 'done':
        return this.meetings.filter(m => m.isDone && !m.isLive);
      case 'live':
        return this.meetings.filter(m => m.isLive);
      default:
        return this.meetings;
    }
  }

  setFilter(filter: 'all' | 'upcoming' | 'done' | 'live') {
    this.filter = filter;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const isoDate = new Date(formValue.date).toISOString();

    const meetData: VirtualMeet = {
      ...formValue,
      date: isoDate,
      meetLink: formValue.meetLink?.trim() === '' ? undefined : formValue.meetLink,
      recordingLink: formValue.recordingLink?.trim() === '' ? undefined : formValue.recordingLink
    };

    const request$ = this.editingId
      ? this.virtualService.updateMeeting(this.editingId, meetData)
      : this.virtualService.createMeeting(meetData);

    request$.subscribe({
      next: () => {
        const isUpdate = !!this.editingId;
        this.loadMeetings();
        this.resetForm();
        this.showForm = false;
        window.alert(`Meeting ${isUpdate ? 'updated' : 'created'} successfully.`);
      },
      error: err => {
        const action = this.editingId ? 'update' : 'create';
        this.error = `Failed to ${action} meeting: ` + (err?.error?.message || err.message || 'Unknown error');
      }
    });
  }

  edit(meeting: VirtualMeet) {
    this.editingId = meeting._id || null;
    const localDate = new Date(meeting.date).toISOString().slice(0, 16);

    this.form.patchValue({
      title: meeting.title,
      agenda: meeting.agenda,
      date: localDate,
      meetLink: meeting.meetLink || '',
      recordingLink: meeting.recordingLink || '',
      isLive: meeting.isLive || false,
    });

    this.showForm = true;
  }

  delete(id?: string) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this meeting?')) {
      this.virtualService.deleteMeeting(id).subscribe({
        next: () => {
          this.loadMeetings();
          window.alert('Meeting deleted successfully.');
        },
        error: () => {
          this.error = 'Failed to delete meeting.';
        }
      });
    }
  }

  resetForm() {
    const defaultDate = new Date().toISOString().slice(0, 16);
    this.form.reset({
      title: '',
      agenda: '',
      date: defaultDate,
      meetLink: '',
      recordingLink: '',
      isLive: false
    });
    this.editingId = null;
    this.error = '';
  }
}
