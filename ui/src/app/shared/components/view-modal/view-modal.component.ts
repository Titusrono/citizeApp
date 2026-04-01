import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-modal.component.html',
  styleUrls: ['./view-modal.component.scss']
})
export class ViewModalComponent {
  @Input() isVisible = false;
  @Input() title = '';
  @Input() data: any = {};
  @Input() fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'date' | 'email' | 'longtext';
    format?: (value: any) => string;
  }> = [];

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getFieldValue(fieldKey: string): string {
    const value = this.data[fieldKey];
    const fieldConfig = this.fields.find(f => f.key === fieldKey);
    
    if (!value) return '—';
    
    if (fieldConfig?.format) {
      return fieldConfig.format(value);
    }
    
    if (fieldConfig?.type === 'date') {
      return new Date(value).toLocaleString();
    }
    
    return String(value);
  }
}
