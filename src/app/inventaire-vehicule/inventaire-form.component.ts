// inventaire-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehiculeService } from '../services/vehicule.service';
import { InventaireService } from '../services/inventaire.service';
import { PositionService } from '../services/position.service';
import { Vehicule } from '../models/vehicule.model';
import { InventaireCreation } from '../models/inventaire.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { Position } from '../models/position.model';
import { HttpErrorResponse } from '@angular/common/http';
import {ParkingService} from '../services/parking.service';

@Component({
  selector: 'app-inventaire-form',
  templateUrl: './inventaire-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    ReactiveFormsModule
  ],
  styleUrls: ['./inventaire-form.component.css']
})
export class InventaireFormComponent implements OnInit {
  inventaireForm: FormGroup;
  vehicules: Vehicule[] = [];
  hasExistingPosition: boolean = false;
  selectedVehiculeId: number | null = null;
  assignedPosition: Position | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  isAssigningPosition: boolean = false;
  private parkingService: any;

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private inventaireService: InventaireService,
    private positionService: PositionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inventaireForm = this.fb.group({
      vehiculeId: ['', Validators.required],
      notesGenerales: [''],
      changerPosition: [false],
      accessoires: this.fb.array([]),
      degats: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadVehicules();

    this.inventaireForm.get('vehiculeId')?.valueChanges.subscribe(vehiculeId => {
      this.selectedVehiculeId = vehiculeId;
      if (vehiculeId) {
        this.checkExistingPositionAndAssign(vehiculeId);
      } else {
        this.resetPositionInfo();
      }
    });

    this.inventaireForm.get('changerPosition')?.valueChanges.subscribe(shouldChange => {
      if (shouldChange && this.selectedVehiculeId) {
        this.assignPositionToVehicle();
      }
    });
  }

  loadVehicules(): void {
    this.vehiculeService.getAllVehicules().subscribe({
      next: (vehicules) => this.vehicules = vehicules,
      error: (err: HttpErrorResponse) => {
        console.error('Error loading vehicles:', err);
        this.errorMessage = 'Failed to load vehicles';
      }
    });
  }

  checkExistingPositionAndAssign(vehiculeId: number): void {
    this.positionService.getVehiclePosition(vehiculeId).subscribe({
      next: (position) => {
        this.hasExistingPosition = !!position;
        this.assignedPosition = position || null;

        // If no existing position or checkbox is checked, assign new position
        if (!this.hasExistingPosition || this.inventaireForm.get('changerPosition')?.value) {
          this.assignPositionToVehicle();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error checking position:', err);
        this.resetPositionInfo();
        // Try to assign position anyway if vehicle is selected
        this.assignPositionToVehicle();
      }
    });
  }

  // Updated method for inventaire-form.component.ts
  assignPositionToVehicle(): void {
    if (!this.selectedVehiculeId) return;

    // Convert to number and validate
    const vehicleId = Number(this.selectedVehiculeId);
    if (isNaN(vehicleId) || vehicleId <= 0) {
      this.errorMessage = 'ID de véhicule invalide';
      this.isAssigningPosition = false;
      return;
    }

    this.isAssigningPosition = true;
    this.errorMessage = '';

    this.positionService.assignPosition(vehicleId).subscribe({
      next: (position) => {
        this.assignedPosition = position;
        this.hasExistingPosition = true;
        this.isAssigningPosition = false;
        this.inventaireForm.patchValue({
          positionId: position.id
        });
        console.log('Position assigned successfully:', position);
        this.parkingService.highlightPosition(position.id);

      },
      error: (err) => {
        console.error('Error assigning position:', err);

        // More specific error handling
        if (err.status === 404) {
          this.errorMessage = 'Véhicule non trouvé';
        } else if (err.status === 409) {
          this.errorMessage = 'Aucune place de parking disponible';
        } else if (err.status === 400) {
          if (err.error && typeof err.error === 'string' && err.error.includes('Failed to convert value')) {
            this.errorMessage = 'Erreur: Format de l\'ID de véhicule invalide';
          } else {
            this.errorMessage = err.error || 'Paramètres invalides';
          }
        } else {
          this.errorMessage = err.error || 'Erreur lors de l\'attribution de la position';
        }

        this.isAssigningPosition = false;
        this.hasExistingPosition = false;
        this.assignedPosition = null;
      }
    });
  }
  resetPositionInfo(): void {
    this.hasExistingPosition = false;
    this.assignedPosition = null;
  }

  get accessoires(): FormArray {
    return this.inventaireForm.get('accessoires') as FormArray;
  }

  get degats(): FormArray {
    return this.inventaireForm.get('degats') as FormArray;
  }

  addAccessoire(): void {
    this.accessoires.push(this.fb.group({
      nom: ['', Validators.required],
      present: [true],
      description: ['']
    }));
  }

  removeAccessoire(index: number): void {
    this.accessoires.removeAt(index);
  }

  addDegat(): void {
    this.degats.push(this.fb.group({
      emplacement: ['', Validators.required],
      gravite: ['LÉGER', Validators.required],
      description: ['']
    }));
  }

  removeDegat(index: number): void {
    this.degats.removeAt(index);
  }

  onSubmit(): void {
    if (this.inventaireForm.invalid || !this.selectedVehiculeId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.inventaireForm.value;
    const inventaireCreation = {
      notesGenerales: formValue.notesGenerales,
      vehiculeId: Number(this.selectedVehiculeId),
      changerPosition: formValue.changerPosition,
      accessoires: formValue.accessoires,
      degats: formValue.degats
    };

    this.inventaireService.createInventaire(inventaireCreation).subscribe({
      next: (createdInventaire) => {
        this.isLoading = false;
        this.router.navigate(['/inventaires/vehicule', this.selectedVehiculeId]);
      },
      error: (err) => {
        console.error('Error creating inventory:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
        this.isLoading = false;
      }
    });
  }}
