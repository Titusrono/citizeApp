import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proposal-view',
  templateUrl: './proposal-view.component.html',
  styleUrls: ['./proposal-view.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProposalViewComponent {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
