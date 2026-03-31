import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-moderator-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moderator-form.component.html'
})
export class ModeratorFormComponent {
  @Input() data: any = {
    name: '',
    email: '',
    role: 'moderator',
    status: 'active'
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
      name: '',
      email: '',
      role: 'moderator',
      status: 'active'
    };
  }

  onClose() {
    this.close.emit();
  }
}
