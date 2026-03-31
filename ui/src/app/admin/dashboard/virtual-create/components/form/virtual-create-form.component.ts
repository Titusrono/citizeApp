import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-virtual-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './virtual-create-form.component.html'
})
export class VirtualCreateFormComponent {
  @Input() data: any = {
    title: '',
    agenda: '',
    date: '',
    meetLink: '',
    recordingLink: '',
    isLive: false
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  onSubmit() {
    this.submit.emit(this.data);
  }

  onReset() {
    this.data = {
      title: '',
      agenda: '',
      date: '',
      meetLink: '',
      recordingLink: '',
      isLive: false
    };
  }

  onClose() {
    this.close.emit();
  }
}
