import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateVoteCreateDto, VoteLevel } from '../../../../../services/vote-create.service';
import { NgSelectModule } from '@ng-select/ng-select';

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
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './vote-create-form.component.html',
  styleUrls: ['./vote-create-form.component.scss']
})
export class VoteCreateFormComponent implements OnInit {
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

  VoteLevel = VoteLevel;

  // County data - Only Kajiado
  subCounties = [
    { name: 'Kajiado North', wards: ['Oloolua', 'Enkarasha', 'Illoodokilani', 'Inkisanjani'] },
    { name: 'Kajiado Central', wards: ['Kitengela', 'Magadi', 'Ngong', 'Isinya', 'Oibor'] },
    { name: 'Kajiado East', wards: ['Imaroro', 'Oloolua', 'Oltepesi', 'Ongata Rongai'] },
    { name: 'Kajiado South', wards: ['Loitokitok', 'Kimana', 'Amboseli', 'Entonet'] },
    { name: 'Kajiado West', wards: ['Kajiado', 'Daraja Mbili', 'Oloosirkon', 'Shompole'] },
  ];
  currentSubCounties: string[] = [];
  currentWards: string[] = [];

  getFilteredWards(): string[] {
    if (!this.selectedWardSubCounty) {
      return [];
    }
    const subCounty = this.subCounties.find(sc => sc.name === this.selectedWardSubCounty);
    return subCounty ? subCounty.wards : [];
  }
  
  onWardSubCountyChange(subCounty: string): void {
    this.selectedWardSubCounty = subCounty;
    // Clear previously selected wards when sub-county changes
    this.proposal.selectedWards = [];
  }

  initializeSubCounties(): void {
    // Initialize sub-counties on component load or when vote level changes
    this.currentSubCounties = this.subCounties.map(sc => sc.name);
  }

  ngOnInit(): void {
    this.initializeSubCounties();
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

  onSubmit() {
    if (this.validateForm()) {
      this.submit.emit(this.proposal);
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

    this.currentSubCounties = [];
    this.currentWards = [];
    this.errors = {};
    this.touched = {};
  }

  onClose() {
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
