import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateVoteCreateDto } from '../../services/vote-create.service';

@Component({
  selector: 'app-vote-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-create-form.component.html'
})
export class VoteCreateFormComponent {
  @Input() proposal: CreateVoteCreateDto = {
    title: '',
    description: '',
    eligibility: '',
    endDate: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<CreateVoteCreateDto>();
  @Output() close = new EventEmitter<void>();

  onSubmit() {
    this.submit.emit(this.proposal);
  }

  onReset() {
    this.proposal = {
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
