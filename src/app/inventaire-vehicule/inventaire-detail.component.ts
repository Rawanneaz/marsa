import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InventaireService } from '../services/inventaire.service';
import { Inventaire } from '../models/inventaire.model';

@Component({
  selector: 'app-inventaire-detail',
  templateUrl: './inventaire-detail.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InventaireDetailComponent implements OnInit {
  inventaire: Inventaire | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventaireService: InventaireService
  ) { }

  ngOnInit(): void {
    this.loadData();

    // Subscribe to inventory updates
    this.inventaireService.inventoriesUpdated$.subscribe(updated => {
      if (updated) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'ID de l\'inventaire non trouvé dans l\'URL';
      this.isLoading = false;
      return;
    }

    console.log('Loading inventory with ID:', id);

    this.inventaireService.getInventaireById(+id).subscribe({
      next: (data) => {
        console.log('API Response:', data);
        if (data) {
          this.inventaire = data;
          console.log('Inventaire loaded successfully:', this.inventaire);

          // Debug position data specifically
          if (this.inventaire.position) {
            console.log('Position data:', this.inventaire.position);
          } else {
            console.warn('No position data in this inventory');
          }
        } else {
          this.errorMessage = 'Inventaire non trouvé';
          console.error('Inventory data is null');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading inventory details:', error);
        this.errorMessage = 'Impossible de charger les détails de l\'inventaire: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  getGraviteClass(gravite: string): string {
    if (!gravite) return 'bg-secondary';

    switch (gravite.toUpperCase()) {
      case 'LÉGER':
      case 'LEGER':
        return 'bg-success';
      case 'MODÉRÉ':
      case 'MODERE':
      case 'MOYEN':
        return 'bg-warning';
      case 'GRAVE':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Date non disponible';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date invalide';
    }
  }
}
