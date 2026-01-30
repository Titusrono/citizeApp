import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-4 py-3 shadow-sm">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
            </svg>
            <span class="font-medium text-gray-800">{{ currentDashboard }}</span>
          </div>
          <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">SUPER ADMIN</span>
        </div>
        
        <div class="flex items-center space-x-3">
          <span class="text-sm text-gray-600">Switch Dashboard:</span>
          <div class="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button 
              (click)="switchToDashboard('/portal')"
              [class]="currentDashboard === 'Citizen Portal' ? 
                'px-4 py-2 text-sm bg-green-600 text-white font-medium' : 
                'px-4 py-2 text-sm bg-white text-gray-700 hover:bg-green-50 border-r border-gray-200 transition-colors duration-200'"
              [disabled]="currentDashboard === 'Citizen Portal'">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Citizen</span>
              </div>
            </button>
            <button 
              (click)="switchToDashboard('/dashboard/moderator')"
              [class]="currentDashboard === 'Admin Dashboard' ? 
                'px-4 py-2 text-sm bg-blue-600 text-white font-medium' : 
                'px-4 py-2 text-sm bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200'"
              [disabled]="currentDashboard === 'Admin Dashboard'">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Admin</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class DashboardSwitcherComponent {
  @Input() currentDashboard: string = '';
  @Output() dashboardSwitch = new EventEmitter<string>();

  constructor(private router: Router) {}

  switchToDashboard(path: string): void {
    this.router.navigate([path]);
    this.dashboardSwitch.emit(path);
  }
}