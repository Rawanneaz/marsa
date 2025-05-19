import { Component, OnInit } from '@angular/core';
import { InventaireService } from '../services/inventaire.service';
import { VehiculeService } from '../services/vehicule.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { Inventaire } from '../models/inventaire.model';
import { Vehicule } from '../models/vehicule.model';

import { OrderByPipe } from './order-by.pipe'; // Importez le pipe

@Component({
  selector: 'app-inventaire-list',
  templateUrl: './inventaire-list.component.html',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CommonModule,
    OrderByPipe,
  ],
  styleUrls: []
})
export class InventaireListComponent implements OnInit {
  vehicule: Vehicule | null = null;
  inventaires: Inventaire[] = [];
  vehiculeId: number | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private inventaireService: InventaireService,
    private vehiculeService: VehiculeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.inventaireService.inventoriesUpdated$.subscribe(updated => {
      if (updated && this.vehiculeId) {
        this.loadInventaires(this.vehiculeId);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.route.params.subscribe(params => {
      this.vehiculeId = +params['vehiculeId'];
      if (this.vehiculeId) {
        this.loadVehicule(this.vehiculeId);
        this.loadInventaires(this.vehiculeId);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadVehicule(vehiculeId: number): void {
    this.vehiculeService.getVehiculeById(vehiculeId).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
      },
      error: (err) => {
        console.error('Error loading vehicle:', err);
        this.errorMessage = 'Failed to load vehicle details';
        this.isLoading = false;
      }
    });
  }

  loadInventaires(vehiculeId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventaireService.getInventairesByVehicule(vehiculeId).subscribe({
      next: (inventaires) => {
        console.log('Inventaires loaded:', inventaires); // Debug log
        this.inventaires = inventaires;
      },
      error: (err) => {
        console.error('Error loading inventories:', err);
        this.errorMessage = 'Failed to load inventories: ' + (err.error?.message || err.message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  createNewInventaire(): void {
    if (this.vehiculeId) {
      this.router.navigate(['/inventaires/nouveau'], {
        queryParams: { vehiculeId: this.vehiculeId }
      });
    }
  }

  refreshInventaires(): void {
    if (this.vehiculeId) {
      this.loadInventaires(this.vehiculeId);
    }
  }
}
