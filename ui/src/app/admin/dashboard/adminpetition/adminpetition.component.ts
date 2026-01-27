import { Component, OnInit } from '@angular/core';
import { PetitionService } from '../../../services/petition.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-adminpetition',
  templateUrl: './adminpetition.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./adminpetition.component.scss']
})
export class AdminpetitionComponent implements OnInit {
  petitions: any[] = [];
  filteredPetitions: any[] = [];
  selectedAuthority: string = '';
  selectedPetition: any = null;

  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  authorityStats: { authority: string; count: number; percentage: number }[] = [];

  constructor(private petitionService: PetitionService) {}

  ngOnInit(): void {
    this.fetchPetitions();
  }

  fetchPetitions(): void {
    this.petitionService.getAllPetitions().subscribe({
      next: (data) => {
        this.petitions = data.map((petition: any) => ({
          ...petition,
          createdBy: petition.createdBy || {
            username: 'Unknown',
            email: '-',
            phone_no: '-',
            subCounty: '-',
            ward: '-'
          }
        }));
        this.computeAuthorityStats();
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load petitions', err);
      }
    });
  }

  applyFilter(): void {
    if (!this.selectedAuthority) {
      this.filteredPetitions = this.petitions;
    } else {
      this.filteredPetitions = this.petitions.filter(
        p => p.targetAuthority === this.selectedAuthority
      );
    }
  }

  computeAuthorityStats(): void {
    const total = this.petitions.length;
    const counts: { [key: string]: number } = {};

    this.authorities.forEach(authority => (counts[authority] = 0));

    this.petitions.forEach(petition => {
      const authority = petition.targetAuthority;
      if (authority && counts.hasOwnProperty(authority)) {
        counts[authority]++;
      }
    });

    this.authorityStats = this.authorities.map(authority => {
      const count = counts[authority] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { authority, count, percentage };
    });
  }

  editPetition(petition: any): void {
    this.selectedPetition = { ...petition };
  }

  cancelEdit(): void {
    this.selectedPetition = null;
  }

  submitEdit(): void {
    const { _id, ...updateData } = this.selectedPetition;
    this.petitionService.updatePetition(_id, updateData).subscribe({
      next: () => {
        this.fetchPetitions();
        this.selectedPetition = null;
      },
      error: (err: any) => {
        console.error('Failed to update petition', err);
      }
    });
  }

  deletePetition(id: string): void {
    if (confirm('Are you sure you want to delete this petition?')) {
      this.petitionService.deletePetition(id).subscribe({
        next: () => this.fetchPetitions(),
        error: (err: any) => console.error('Failed to delete petition', err)
      });
    }
  }
}
