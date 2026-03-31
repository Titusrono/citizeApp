import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-proposal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proposal-form.component.html'
})
export class ProposalFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    eligibility: '',
    endDate: ''
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
      description: '',
      eligibility: '',
      endDate: ''
    };
  }

  onClose() {
    this.close.emit();
  }
}
