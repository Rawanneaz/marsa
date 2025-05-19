import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CamionSortie } from '../models/CamionSortie.model';
import { CamionSortieService } from '../services/camion-sortie.service';

@Component({
  selector: 'app-camion-sortie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './camion-sortie-list.component.html',
  styleUrls: []
})
export class CamionSortieListComponent implements OnInit {
  camions: CamionSortie[] = [];
  displayedColumns: string[] = ['id', 'matricule', 'dateSortie', 'clientNom', 'chauffeur', 'vehiculesCount', 'actions'];
  isLoading = false;
  error: string | null = null;

  constructor(
    private camionSortieService: CamionSortieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCamions();
  }

  loadCamions(): void {
    this.isLoading = true;
    this.error = null;

    this.camionSortieService.getAllCamionsSortie().subscribe({
      next: (data) => {
        this.camions = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des camions de sortie';
        this.isLoading = false;
        console.error('Erreur détaillée:', error);
      }
    });
  }

  deleteCamion(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce camion de sortie ?')) {
      this.camionSortieService.deleteCamionSortie(id).subscribe({
        next: () => {
          this.snackBar.open('Camion supprimé avec succès', 'Fermer', { duration: 3000 });
          this.loadCamions(); // Refresh the list
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 5000 });
          console.error('Erreur détaillée:', error);
        }
      });
    }
  }

  // Helper method to get formatted date
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
