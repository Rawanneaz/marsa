import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CamionSortieService } from '../services/camion-sortie.service';
import { VehiculeService } from '../services/vehicule.service';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { Vehicule } from '../models/vehicule.model';
import { CamionSortieCreation } from '../models/camion-sortie-creation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { VehiculeStatut } from '../models/vehicule-statut.enum';

@Component({
  selector: 'app-camion-sortie-form',
  templateUrl: './camion-sortie-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],
  styleUrls: []
})
export class CamionSortieFormComponent implements OnInit, OnDestroy {
  camionForm: FormGroup;
  clients: Client[] = [];
  vehiculesDisponibles: Vehicule[] = [];
  vehiculesSelectionnes: Vehicule[] = [];
  rechercheTerm: string = '';
  mode: 'create' | 'edit' = 'create';
  camionId?: number;
  isLoading = false;

  // Remplacez l'Observable par une variable locale
  vehiculesFiltres: Vehicule[] = [];
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private camionSortieService: CamionSortieService,
    private vehiculeService: VehiculeService,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.camionForm = this.fb.group({
      matricule: ['', [Validators.required]],
      clientId: [null],
      dateSortie: [new Date(), [Validators.required]],
      notes: [''],
      chauffeur: ['', [Validators.required]],
      recherche: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadVehiculesDisponibles();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mode = 'edit';
        this.camionId = +params['id'];
        this.loadCamionDetails(this.camionId);
      }
    });

    // Souscrire aux changements de la recherche
    const rechercheSubscription = this.camionForm.get('recherche')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVehicules(value || ''))
    ).subscribe(vehicules => {
      this.vehiculesFiltres = vehicules;
    });

    this.subscription.add(rechercheSubscription);
  }

  ngOnDestroy(): void {
    // Nettoyage des souscriptions pour éviter les fuites mémoire
    this.subscription.unsubscribe();
  }

  private _filterVehicules(value: string): Vehicule[] {
    const filterValue = value.toLowerCase();
    const filteredVehicules = this.vehiculesDisponibles.filter(vehicule => {
      const numero = vehicule.numeroIdentification?.toLowerCase() ?? '';
      const marque = vehicule.marque?.toLowerCase() ?? '';
      const modele = vehicule.modele?.toLowerCase() ?? '';
      const statut = vehicule.statut?.toUpperCase() ?? '';

      const matchesSearch =
        numero.includes(filterValue) ||
        marque.includes(filterValue) ||
        modele.includes(filterValue);

      const matchesStatut = statut === VehiculeStatut.GARE.toUpperCase();

      console.log(`Vehicle Check:
      NumeroIdentification: ${numero}
      Marque: ${marque}
      Modele: ${modele}
      Current Statut: ${statut}
      Expected Statut: ${VehiculeStatut.GARE.toUpperCase()}
      Matches Search: ${matchesSearch}
      Matches Statut: ${matchesStatut}`);

      return matchesSearch && matchesStatut;
    });

    console.log('Filtered Vehicles:', filteredVehicules);
    return filteredVehicules;
  }

  filtrerVehicules(): void {
    this.vehiculesFiltres = this._filterVehicules(this.rechercheTerm);
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => this.clients = data,
      error: (error) => {
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
        console.error('Erreur de chargement des clients:', error);
      }
    });
  }

  loadVehiculesDisponibles(): void {
    console.log('Loading vehicles with status:', VehiculeStatut.GARE);

    this.vehiculeService.getVehiculesByStatut(VehiculeStatut.GARE).subscribe({
      next: (data) => {
        console.log('Received vehicles:', data);
        console.log('Vehicle statuses:', data.map(v => v.statut));

        this.vehiculesDisponibles = data.filter(
          vehicule => vehicule.statut === VehiculeStatut.GARE
        );

        this.vehiculesFiltres = [...this.vehiculesDisponibles];

        console.log('Vehicles Disponibles:', this.vehiculesDisponibles);
        console.log('Vehicles Filtres:', this.vehiculesFiltres);

        if (this.vehiculesDisponibles.length === 0) {
          this.snackBar.open('Aucun véhicule garé trouvé', 'OK', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Complete error:', error);
        this.snackBar.open(`Erreur de chargement: ${error.message}`, 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  loadCamionDetails(id: number): void {
    this.isLoading = true;
    this.camionSortieService.getCamionSortieById(id).subscribe({
      next: (camion) => {
        this.camionForm.patchValue({
          matricule: camion.matricule,
          clientId: camion.clientId,
          dateSortie: new Date(camion.dateSortie),
          notes: camion.notes,
          chauffeur: camion.chauffeur
        });
        this.vehiculesSelectionnes = camion.vehicules ?? [];
        this.loadVehiculesDisponibles();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des détails', 'Fermer', { duration: 3000 });
        console.error('Erreur de chargement:', error);
      }
    });
  }

  ajouterVehicule(vehicule: Vehicule): void {
    if (!this.vehiculesSelectionnes.some(v => v.id === vehicule.id)) {
      this.vehiculesSelectionnes.push(vehicule);
      this.vehiculesDisponibles = this.vehiculesDisponibles.filter(v => v.id !== vehicule.id);

      if (this.mode === 'edit' && this.camionId) {
        this.camionSortieService.ajouterVehiculeAuCamion(this.camionId, vehicule.id).subscribe({
          next: () => this.snackBar.open('Véhicule ajouté', 'Fermer', { duration: 2000 }),
          error: (error) => {
            this.snackBar.open('Erreur lors de l\'ajout', 'Fermer', { duration: 3000 });
            console.error('Erreur:', error);
          }
        });
      }
    }
  }

  retirerVehicule(vehicule: Vehicule): void {
    this.vehiculesSelectionnes = this.vehiculesSelectionnes.filter(v => v.id !== vehicule.id);
    this.vehiculesDisponibles.push(vehicule);

    if (this.mode === 'edit' && this.camionId) {
      this.camionSortieService.retirerVehiculeDuCamion(this.camionId, vehicule.id).subscribe({
        next: () => this.snackBar.open('Véhicule retiré', 'Fermer', { duration: 2000 }),
        error: (error) => {
          this.snackBar.open('Erreur lors du retrait', 'Fermer', { duration: 3000 });
          console.error('Erreur:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.camionForm.invalid) {
      return;
    }

    this.isLoading = true;
    const camionData: CamionSortieCreation = {
      ...this.camionForm.value,
      vehiculeIds: this.vehiculesSelectionnes.map(v => v.id)
    };

    if (this.mode === 'create') {
      this.camionSortieService.createCamionSortie(camionData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Camion créé', 'Fermer', { duration: 3000 });
          this.router.navigate(['/camions-sortie']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Erreur de création', 'Fermer', { duration: 5000 });
          console.error('Erreur:', error);
        }
      });
    } else if (this.mode === 'edit' && this.camionId) {
      this.camionSortieService.updateCamionSortie(this.camionId, camionData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Camion mis à jour', 'Fermer', { duration: 3000 });
          this.router.navigate(['/camions-sortie']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Erreur de mise à jour', 'Fermer', { duration: 5000 });
          console.error('Erreur:', error);
        }
      });
    }
  }
}
