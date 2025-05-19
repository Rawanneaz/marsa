import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehiculeService } from '../services/vehicule.service';
import { OperationService } from '../services/operation.service';
import { CommonModule } from '@angular/common';
import { ArrivalDto } from '../models/arrival.dto';
import { Operation } from '../models/operation.model';

@Component({
  selector: 'app-pointage-arrivee',
  templateUrl: './pointage-arrivee.component.html',
  standalone: true,
  styleUrls: ['./liste-vehicules-arrives.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class PointageArriveeComponent implements OnInit {
  arriveeForm: FormGroup;
  submitting = false;
  message: string | null = null;
  isError = false;
  operations: Operation[] = [];
  loadingOperations = false;

  constructor(
    private fb: FormBuilder,
    private vehiculeService: VehiculeService,
    private operationService: OperationService,
    private router: Router
  ) {
    this.arriveeForm = this.fb.group({
      numeroIdentification: ['', [
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
        Validators.pattern(/^[0-9a-zA-Z]{14}$/)
      ]],
      dateArrivee: [new Date().toISOString().slice(0, 16), Validators.required],
      operationId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOperations();
  }

  loadOperations(): void {
    this.loadingOperations = true;
    this.operationService.getAll().subscribe({
      next: (operations) => {
        this.operations = operations;
        this.loadingOperations = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des opérations:', error);
        this.loadingOperations = false;
      }
    });
  }

  onSubmit(): void {
    if (this.arriveeForm.invalid || this.submitting) {
      this.arriveeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.message = null;
    this.isError = false;

    const formData: ArrivalDto = {
      numeroIdentification: this.arriveeForm.value.numeroIdentification,
      dateArrivee: new Date(this.arriveeForm.value.dateArrivee).toISOString(),
      operationId: this.arriveeForm.value.operationId
    };

    this.vehiculeService.enregistrerArrivee(formData)
      .subscribe({
        next: (response) => {
          this.message = 'Pointage enregistré avec succès';
          this.isError = false;
          this.arriveeForm.reset({
            dateArrivee: new Date().toISOString().slice(0, 16)
          });
          // Ajout d'un timeout pour la redirection
          setTimeout(() => {
            this.router.navigate(['/liste-arrivees']);
          }, 1500);
        },
        error: (error) => {
          this.isError = true;
          this.message = error.message || 'Erreur inconnue lors de l\'enregistrement';
          console.error('Erreur détaillée:', error);
        },
        complete: () => {
          this.submitting = false; // Garantit que submitting est bien reset même en cas d'erreur
        }
      });
  }

  activerScanner(): void {
    // Logique du scanner à implémenter
    console.log('Scanner activé');

    // Mock scanner functionality for testing
    // In a real implementation, this would connect to a barcode scanner
    const mockScanResult = '12345678912345';
    this.arriveeForm.patchValue({
      numeroIdentification: mockScanResult
    });
  }

  // Helper pour afficher le nom de l'opération dans le dropdown
  getOperationLabel(operation: Operation): string {
    let label = `Opération #${operation.id}`;

    if (operation.navire?.name) {
      label += ` - Navire: ${operation.navire.name}`;
    }

    if (operation.client?.name) {
      label += ` - Client: ${operation.client.name}`;
    }

    if (operation.navire?.numeroEscale) {
      label += ` (Escale: ${operation.navire.numeroEscale})`;
    }

    return label;
  }
}
