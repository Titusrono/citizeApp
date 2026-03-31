import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-admin-form.component.html'
})
export class ReportAdminFormComponent {
  @Input() data: any = {
    description: '',
    location: '',
    category: '',
    images: []
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
      description: '',
      location: '',
      category: '',
      images: []
    };
  }

  onClose() {
    this.close.emit();
  }
}

