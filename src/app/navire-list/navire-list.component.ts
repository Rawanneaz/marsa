import { Component, OnInit } from '@angular/core';
import { NavireService } from '../services/navire.service';
import { Navire } from '../models/navire.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navire-list',
  templateUrl: './navire-list.component.html',
  standalone: true,
  styleUrls: ['./navire-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class NavireListComponent implements OnInit {
  navires: Navire[] = [];
  isAddingNavire: boolean = false;
  isEditingNavire: boolean = false;
  navire: Navire = { name: '', numeroEscale: '' };
  loading: boolean = false;
  errorMessage: string = '';
  showErrorModal: boolean = false;

  constructor(private navireService: NavireService) {}

  ngOnInit(): void {
    this.loadNavires();
    this.navireService.refreshNeeded$.subscribe(() => {
      this.loadNavires();
    });
  }

  loadNavires(): void {
    this.loading = true;
    this.navireService.getAll().subscribe({
      next: (navires) => {
        this.navires = [...navires];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching navires', err);
        this.loading = false;
      }
    });
  }

  toggleAddNavireForm(): void {
    this.isAddingNavire = !this.isAddingNavire;
    if (!this.isAddingNavire) {
      this.resetForm();
    }
    if (this.isAddingNavire) {
      this.isEditingNavire = false;
    }
  }

  deleteNavire(id: number | undefined): void {
    if (id === undefined) {
      console.error('Navire ID is undefined');
      this.showError('ID du navire non défini');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce navire?')) {
      this.loading = true;

      this.navireService.delete(id).subscribe({
        next: () => {
          console.log('Navire deleted successfully');
          this.loading = false;
          // Force a manual refresh just to be sure
          this.loadNavires();
        },
        error: (err) => {
          console.error('Error deleting navire:', err);
          this.loading = false;
          this.showError('Erreur lors de la suppression du navire: ' + (err.error?.message || 'Erreur inconnue'));
        },
        complete: () => {
          // Make sure loading is set to false even if something unexpected happens
          this.loading = false;
        }
      });
    }
  }

  editNavire(navire: Navire): void {
    this.isEditingNavire = true;
    this.isAddingNavire = true;
    this.navire = { ...navire };
  }

  cancelEdit(): void {
    this.isEditingNavire = false;
    this.isAddingNavire = false;
    this.resetForm();
  }

  resetForm(): void {
    this.navire = { name: '', numeroEscale: '' };
    this.errorMessage = '';
    this.showErrorModal = false;
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorModal(): void {
    this.errorMessage = '';
    this.showErrorModal = false;
  }

  onSubmit(): void {
    console.log('Submitting navire:', this.navire);

    // Submit even if fields are empty - let server handle validation if needed
    this.loading = true;
    if (this.isEditingNavire && this.navire.id) {
      this.navireService.update(this.navire.id, this.navire).subscribe({
        next: (response) => {
          this.loadNavires();
          this.resetForm();
          this.isEditingNavire = false;
          this.isAddingNavire = false;
        },
        error: (err) => {
          console.error('Error updating navire:', err);
          this.loading = false;
          // Show error if the server returns an error about duplicate escale
          if (err.error && err.error.message && err.error.message.includes('escale')) {
            this.showError('Ce numéro d\'escale existe déjà');
          }
        }
      });
    } else {
      this.navireService.create(this.navire).subscribe({
        next: (response) => {
          this.loadNavires();
          this.resetForm();
          this.isAddingNavire = false;
        },
        error: (err) => {
          console.error('Error creating navire:', err);
          this.loading = false;
          // Show error if the server returns an error about duplicate escale
          if (err.error && err.error.message && err.error.message.includes('escale')) {
            this.showError('Ce numéro d\'escale existe déjà');
          }
        }
      });
    }
  }
}
