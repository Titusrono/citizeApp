import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-petition-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminpetition-form.component.html'
})
export class AdminPetitionFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    targetAuthority: '',
    status: 'pending'
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  onSubmit() {
    this.submit.emit(this.data);
  }

  onReset() {
    this.data = {
      title: '',
      description: '',
      targetAuthority: '',
      status: 'pending'
    };
  }

  onClose() {
    this.close.emit();
  }
}
