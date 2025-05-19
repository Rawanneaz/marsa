import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VehiculeService } from '../services/vehicule.service';
import { InventaireService } from '../services/inventaire.service';
import { VehiculeArrivee } from '../models/vehiculeArrivee.model';
import { catchError, finalize,  map, switchMap, tap } from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Étendre le model pour inclure le comptage des inventaires
interface VehiculeArriveeEtendu extends VehiculeArrivee {
  nbInventaires?: number;
}

@Component({
  selector: 'app-vehicules-arrives',
  templateUrl: './liste-vehicules-arrives.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./liste-vehicules-arrives.component.css']
})
export class VehiculesArrivesComponent implements OnInit {
  vehicules: VehiculeArriveeEtendu[] = [];
  vehiculesFiltres: VehiculeArriveeEtendu[] = [];
  filtreNumero: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  success: string | null = null;
  activeDropdown: number | null = null;

  constructor(
    private vehiculeService: VehiculeService,
    private inventaireService: InventaireService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.refreshList();
  }

  refreshList(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.success = null;

    this.vehiculeService.getAllVehicules()
      .pipe(
        tap(data => {
          this.vehicules = data.map(v => ({
            ...v,
            id: v.id,
            numeroIdentification: v.numeroIdentification,
            dateArrivee: v.dateArrivee,
            statut: v.statut,
            nbInventaires: 0 // On initialise à 0
          }));
          this.appliquerFiltre();
        }),
        // Après avoir chargé les véhicules, on récupère le nombre d'inventaires pour chacun
        switchMap(() => {
          const inventaireRequests = this.vehicules.map(vehicule =>
            this.chargerNombreInventaires(vehicule.id).pipe(
              tap(count => {
                const index = this.vehicules.findIndex(v => v.id === vehicule.id);
                if (index !== -1) {
                  this.vehicules[index].nbInventaires = count;
                }
              }),
              catchError(() => of(0)) // En cas d'erreur, on retourne 0
            )
          );

          // Si la liste est vide, on retourne un Observable vide
          if (inventaireRequests.length === 0) {
            return of([]);
          }

          return forkJoin(inventaireRequests);
        }),
        catchError(error => {
          this.errorMessage = `Erreur lors du chargement des véhicules: ${error.message || 'Une erreur est survenue'}`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.appliquerFiltre(); // Mise à jour des filtres après le chargement complet
        })
      )
      .subscribe();
  }

  chargerNombreInventaires(vehiculeId: number): Observable<number> {
    // Utilisez la méthode alternative si vous n'avez pas d'endpoint dédié
    return this.inventaireService.getInventairesByVehicule(vehiculeId).pipe(
      map(inventaires => inventaires.length),
      catchError(() => of(0))
    );
  }

  appliquerFiltre(): void {
    if (!this.filtreNumero || this.filtreNumero.trim() === '') {
      this.vehiculesFiltres = [...this.vehicules];
    } else {
      const filtre = this.filtreNumero.toLowerCase();
      this.vehiculesFiltres = this.vehicules.filter(v =>
        v.numeroIdentification.toLowerCase().includes(filtre)
      );
    }
  }

  toggleStatusMenu(id: number): void {
    if (this.activeDropdown === id) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = id;
    }
  }

  changerStatut(vehicule: VehiculeArriveeEtendu, statut: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.activeDropdown = null; // Close dropdown after selection

    this.vehiculeService.updateStatut(vehicule.id, statut)
      .pipe(
        tap(updatedVehicule => {
          const index = this.vehicules.findIndex(v => v.id === vehicule.id);
          if (index !== -1) {
            this.vehicules[index].statut = updatedVehicule.statut;
            this.appliquerFiltre();
            this.success = `Statut du véhicule ${vehicule.numeroIdentification} mis à jour avec succès.`;
          }
        }),
        catchError(error => {
          this.errorMessage = `Erreur lors de la mise à jour du statut: ${error.message || 'Une erreur est survenue'}`;
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  ouvrirInventaire(id: number, numeroIdentification: string): void {
    this.router.navigate(['/inventaires/vehicule/:id', id, numeroIdentification]);
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'ARRIVÉ':
        return 'bg-primary';
      case 'EN_TRAITEMENT':
        return 'bg-warning text-dark';
      case 'EN_ATTENTE':
        return 'bg-secondary';
      case 'GARÉE':
        return 'bg-info text-dark';
      case 'LIBÉRÉ':
        return 'bg-success';
      case 'SORTI':
        return 'bg-dark';
      default:
        return 'bg-light text-dark';
    }
  }
}
