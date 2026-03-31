import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usersreg-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usersreg-form.component.html'
})
export class UsersregFormComponent {
  @Input() data: any = {
    email: '',
    username: '',
    phone_no: '',
    subCounty: '',
    ward: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  subCounties: string[] = [
    'Tetu',
    'Kieni',
    'Mathira East',
    'Mathira West',
    'Othaya',
    'Mukurweini'
  ];

  onSubmit(): void {
    this.submit.emit(this.data);
  }

  onReset(): void {
    this.data = {
      email: '',
      username: '',
      phone_no: '',
      subCounty: '',
      ward: ''
    };
  }

  onClose(): void {
    this.close.emit();
  }
}
