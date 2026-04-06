import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateVoteCreateDto, VoteLevel } from '../../services/vote-create.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LocationService } from '../../../../../shared/services/location.service';

interface FormErrors {
  title?: string;
  description?: string;
  eligibility?: string;
  endDate?: string;
  voteLevel?: string;
}

@Component({
  selector: 'app-vote-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent],
  providers: [LocationService],
  templateUrl: './vote-create-form.component.html',
  styleUrls: ['./vote-create-form.component.scss']
})
export class VoteCreateFormComponent implements OnInit, OnChanges {
  @Input() proposal: CreateVoteCreateDto = {
    title: '',
    description: '',
    eligibility: '',
    endDate: '',
    voteLevel: VoteLevel.GENERAL,
    selectedSubCounties: [],
    selectedWards: []
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  @Output() submit = new EventEmitter<CreateVoteCreateDto>();
  @Output() close = new EventEmitter<void>();

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};
  selectedWardSubCounty: string = ''; // Track single sub-county selection for Ward level
  isSubmittingLocal = false; // Local flag to prevent double submission
  isInitializing = true; // Track if we're in initialization phase

  VoteLevel = VoteLevel;

  // Use LocationService for subcounties and wards
  subCounties: any[] = [];
  currentSubCounties: string[] = [];
  filteredWards: any[] = []; // Cache filtered wards to prevent infinite loops

  constructor(private locationService: LocationService) {}

  getFilteredWards(): any[] {
    return this.filteredWards;
  }

  compareWards(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }
  
  onWardSubCountyChange(subCounty: string): void {
    this.selectedWardSubCounty = subCounty;
    // Only clear selected wards when user manually changes subcounty (not during initialization)
    if (!this.isInitializing) {
      this.proposal.selectedWards = [];
    }
    
    // Update cached filtered wards
    if (subCounty) {
      const wards = this.locationService.getWardsForSubCounty(subCounty);
      // Convert string array to objects with name property for ng-select
      this.filteredWards = wards.map(ward => ({ name: ward, value: ward }));
    } else {
      this.filteredWards = [];
    }
  }

  initializeSubCounties(): void {
    // Get subcounties from LocationService for consistency
    this.subCounties = this.locationService.getSubCounties();
    this.currentSubCounties = this.locationService.getSubCountyNames();
  }

  ngOnInit(): void {
    this.initializeSubCounties();
    this.isSubmittingLocal = false;
    // Mark initialization complete after ngOnInit, so ngOnChanges after this knows we're in a user action
    setTimeout(() => {
      this.isInitializing = false;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle changes to proposal for edit mode
    if (changes['proposal'] && changes['proposal'].currentValue) {
      const proposal = changes['proposal'].currentValue;
      
      // If this is a ward-level vote, pre-populate the selectedWardSubCounty
      if (proposal.voteLevel === VoteLevel.WARD && proposal.selectedWards && proposal.selectedWards.length > 0) {
        // Get the first selected ward and find its sub-county
        const firstWard = proposal.selectedWards[0];
        const subCountyForWard = this.locationService.getSubCountyForWard(firstWard);
        if (subCountyForWard) {
          this.selectedWardSubCounty = subCountyForWard;
          // Trigger the change to populate filtered wards (don't clear wards during initialization)
          this.isInitializing = true;
          this.onWardSubCountyChange(subCountyForWard);
          this.isInitializing = false;
        }
      }
    }
  }

  validateField(fieldName: string): boolean {
    const value = this.proposal[fieldName as keyof CreateVoteCreateDto]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Proposal title is required';
        } else if (value.length < 5) {
          this.errors.title = 'Title must be at least 5 characters';
        } else if (value.length > 200) {
          this.errors.title = 'Title cannot exceed 200 characters';
        }
        break;

      case 'description':
        if (!value) {
          this.errors.description = 'Description is required';
        } else if (value.length < 20) {
          this.errors.description = 'Description must be at least 20 characters';
        } else if (value.length > 2000) {
          this.errors.description = 'Description cannot exceed 2000 characters';
        }
        break;

      case 'endDate':
        if (!value) {
          this.errors.endDate = 'End date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            this.errors.endDate = 'End date must be in the future';
          }
        }
        break;

      case 'voteLevel':
        // No validation needed, all levels are valid
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'description', 'endDate', 'voteLevel'];
    let isValid = true;
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    // Additional validation for level-specific selections
    if (this.proposal.voteLevel === VoteLevel.SUB_COUNTY) {
      if (!this.proposal.selectedSubCounties || this.proposal.selectedSubCounties.length === 0) {
        this.errors.voteLevel = 'Please select at least one sub-county';
        isValid = false;
      }
    }
    
    if (this.proposal.voteLevel === VoteLevel.WARD) {
      if (!this.selectedWardSubCounty) {
        this.errors.voteLevel = 'Please select a sub-county';
        isValid = false;
      } else if (!this.proposal.selectedWards || this.proposal.selectedWards.length === 0) {
        this.errors.voteLevel = 'Please select at least one ward';
        isValid = false;
      }
    }
    
    return isValid;
  }

  markFieldTouched(fieldName: string) {
    this.touched[fieldName] = true;
    this.validateField(fieldName);
  }

  hasError(fieldName: string): boolean {
    return (this.touched[fieldName] || false) && !!this.errors[fieldName as keyof FormErrors];
  }

  hasSuccess(fieldName: string): boolean {
    return (this.touched[fieldName] || false) && !this.errors[fieldName as keyof FormErrors] && !!this.proposal[fieldName as keyof CreateVoteCreateDto];
  }

  getDescriptionCharCount(): string {
    return (this.proposal.description?.length || 0).toString();
  }

  /**
   * For ward-level votes, derive the subcounties from the selected wards
   */
  private getSubCountiesFromWards(wards: string[]): string[] {
    if (!wards || wards.length === 0) {
      return [];
    }
    
    const subCounties = new Set<string>();
    for (const ward of wards) {
      const subCounty = this.locationService.getSubCountyForWard(ward);
      if (subCounty) {
        subCounties.add(subCounty);
      }
    }
    
    return Array.from(subCounties);
  }

  onSubmit() {
    // Prevent double submission
    if (this.isSubmittingLocal || this.isSubmitting) {
      return;
    }

    if (this.validateForm()) {
      // Create a deep copy to ensure data is properly captured
      let selectedSubCounties = this.proposal.selectedSubCounties || [];
      let selectedWards = this.proposal.selectedWards || [];

      // Deduplicate arrays
      selectedSubCounties = Array.from(new Set(selectedSubCounties));
      selectedWards = Array.from(new Set(selectedWards));

      // For WARD-level votes, derive subcounties from selected wards
      if (this.proposal.voteLevel === VoteLevel.WARD && selectedWards.length > 0) {
        selectedSubCounties = this.getSubCountiesFromWards(selectedWards);
      }

      const submissionData: CreateVoteCreateDto = {
        title: this.proposal.title?.trim() || '',
        description: this.proposal.description?.trim() || '',
        eligibility: this.proposal.eligibility?.trim() || '',
        endDate: this.proposal.endDate || '',
        voteLevel: this.proposal.voteLevel || VoteLevel.GENERAL,
        selectedSubCounties: selectedSubCounties,
        selectedWards: selectedWards
      };

      console.log('[VoteCreateForm.onSubmit] Submitting vote:', {
        voteLevel: submissionData.voteLevel,
        selectedSubCounties: submissionData.selectedSubCounties,
        selectedWards: submissionData.selectedWards
      });

      this.isSubmittingLocal = true;
      this.submit.emit(submissionData);
    }
  }

  onReset() {
    this.proposal = {
      title: '',
      description: '',
      eligibility: '',
      endDate: '',
      voteLevel: VoteLevel.GENERAL,
      selectedSubCounties: [],
      selectedWards: []
    };
    this.selectedWardSubCounty = '';
    this.filteredWards = [];
    this.errors = {};
    this.touched = {};
    this.isSubmittingLocal = false;
    this.isInitializing = true;
  }

  onClose() {
    this.isSubmittingLocal = false;
    this.close.emit();
  }

  toggleSubCounty(subCounty: string) {
    if (!this.proposal.selectedSubCounties) {
      this.proposal.selectedSubCounties = [];
    }
    const index = this.proposal.selectedSubCounties.indexOf(subCounty);
    if (index > -1) {
      this.proposal.selectedSubCounties.splice(index, 1);
      // Remove wards that belong only to this sub-county
      const subCountyObj = this.subCounties.find(sc => sc.name === subCounty);
      const wardsForSubCounty = subCountyObj?.wards || [];
      this.proposal.selectedWards = this.proposal.selectedWards?.filter(ward => {
        // Keep ward if it exists in other selected sub-counties
        return this.proposal.selectedSubCounties!.some(sc => {
          const scObj = this.subCounties.find(s => s.name === sc);
          return scObj?.wards.includes(ward);
        });
      }) || [];
    } else {
      this.proposal.selectedSubCounties.push(subCounty);
    }
  }

  toggleWard(ward: string) {
    if (!this.proposal.selectedWards) {
      this.proposal.selectedWards = [];
    }
    const index = this.proposal.selectedWards.indexOf(ward);
    if (index > -1) {
      this.proposal.selectedWards.splice(index, 1);
    } else {
      this.proposal.selectedWards.push(ward);
    }
  }

  isSubCountySelected(subCounty: string): boolean {
    return this.proposal.selectedSubCounties?.includes(subCounty) || false;
  }

  isWardSelected(ward: string): boolean {
    return this.proposal.selectedWards?.includes(ward) || false;
  }
}
