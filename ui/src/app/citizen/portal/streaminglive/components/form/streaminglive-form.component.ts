import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-streaming-live-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './streaminglive-form.component.html'
})
export class StreamingLiveFormComponent {
  @Input() meeting: any = {
    title: '',
    agenda: '',
    date: '',
    meetLink: '',
    recordingLink: '',
    isLive: false
  };
  @Input() data: any = {
    title: '',
    description: '',
    streamUrl: '',
    startTime: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private initialData: any = null;

  ngOnInit() {
    this.initialData = { ...this.data };
  }

  onSubmit(): void {
    this.submit.emit(this.data);
  }

  onReset(): void {
    if (this.initialData) {
      this.data = { ...this.initialData };
    } else {
      this.data = {
        title: '',
        description: '',
        streamUrl: '',
        startTime: ''
      };
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
