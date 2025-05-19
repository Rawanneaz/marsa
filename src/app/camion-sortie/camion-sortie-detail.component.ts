import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CamionSortieService } from '../services/camion-sortie.service';
import { CamionSortie } from '../models/CamionSortie.model';

@Component({
  selector: 'app-camion-sortie-detail',
  templateUrl: './camion-sortie-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  styleUrls: []
})
export class CamionSortieDetailComponent implements OnInit {
  camionId: number = 0;
  camion: CamionSortie | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private camionSortieService: CamionSortieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.camionId = +params['id'];
        this.loadCamionDetails();
      } else {
        this.router.navigate(['/camions-sortie']);
      }
    });
  }

  loadCamionDetails(): void {
    this.isLoading = true;
    this.camionSortieService.getCamionSortieById(this.camionId).subscribe({
      next: (data) => {
        this.camion = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du chargement des détails', 'Fermer', { duration: 3000 });
        console.error('Erreur de chargement:', err);
        this.isLoading = false;
        this.router.navigate(['/camions-sortie']);
      }
    });
  }

  confirmerSuppression(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce camion ?')) {
      this.isLoading = true;
      this.camionSortieService.deleteCamionSortie(this.camionId).subscribe({
        next: () => {
          this.snackBar.open('Camion supprimé', 'Fermer', { duration: 3000 });
          this.router.navigate(['/camions-sortie']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          console.error('Erreur de suppression:', err);
        }
      });
    }
  }
}
