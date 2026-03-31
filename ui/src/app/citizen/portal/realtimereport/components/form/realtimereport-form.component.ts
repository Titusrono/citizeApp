import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-realtimereport-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './realtimereport-form.component.html'
})
export class RealtimereportFormComponent {
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

  categories = ['pothole', 'flooding', 'sanitation', 'other'];

  onSubmit(): void {
    this.submit.emit(this.data);
  }

  onReset(): void {
    this.data = {
      description: '',
      location: '',
      category: '',
      images: []
    };
  }

  onClose(): void {
    this.close.emit();
  }
}
