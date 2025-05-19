import { Component, OnInit } from '@angular/core';
import { OperationService } from '../services/operation.service';
import { Operation } from '../models/operation.model';
import { NavireService } from '../services/navire.service';
import { ClientService } from '../services/client.service';
import { Navire } from '../models/navire.model';
import { Client } from '../models/client.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  standalone: true,
  styleUrls: ['./operation-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class OperationListComponent implements OnInit {
  operations: Operation[] = [];
  navires: Navire[] = [];
  clients: Client[] = [];
  errorMessage: string = '';
  selectedNavire: Navire | null = null;
  showErrorModal: boolean = false;

  // Form state variables
  isAddingOperation: boolean = false;
  isEditingOperation: boolean = false;
  operation: Operation = this.createNewOperation();

  constructor(
    private operationService: OperationService,
    private navireService: NavireService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.showError(params['error']);
      }
      if (params['showAddForm']) {
        this.isAddingOperation = true;
      }
    });

    this.loadOperations();
    this.loadNavires();
    this.loadClients();
  }

  createNewOperation(): Operation {
    return {
      dateOperation: new Date().toISOString().split('T')[0],
      connaissementsCount: 0,
      carCount: 0,
      navire: { id: undefined },
      client: { id: undefined }
    };
  }

  loadOperations(): void {
    this.errorMessage = '';

    this.operationService.getAll().pipe(
      catchError(error => {
        console.error('Error loading operations:', error);
        this.showError('Impossible de charger les opérations. Veuillez réessayer.');
        return of([]);
      })
    ).subscribe(operations => {
      console.log('Retrieved operations:', operations);
      this.operations = operations;
    });
  }

  loadNavires(): void {
    this.navireService.getAll().pipe(
      catchError(error => {
        console.error('Error fetching navires', error);
        this.showError('Erreur lors du chargement des navires');
        return of([]);
      })
    ).subscribe(navires => {
      this.navires = navires;
    });
  }

  loadClients(): void {
    this.clientService.getAll().pipe(
      catchError(error => {
        console.error('Error fetching clients', error);
        this.showError('Erreur lors du chargement des clients');
        return of([]);
      })
    ).subscribe(clients => {
      this.clients = clients;
    });
  }

  toggleAddOperationForm(): void {
    this.isAddingOperation = !this.isAddingOperation;
    // If canceling, reset the form
    if (!this.isAddingOperation) {
      this.resetForm();
    }
    // When toggling to add mode, ensure edit mode is off
    if (this.isAddingOperation) {
      this.isEditingOperation = false;
    }
  }

  editOperation(operation: Operation): void {
    this.isEditingOperation = true;
    this.isAddingOperation = true; // Make sure form is visible
    this.errorMessage = ''; // Clear any existing error messages
    this.showErrorModal = false;

    // Format date for the date input
    let formattedDate: string;
    if (operation.dateOperation instanceof Date) {
      formattedDate = operation.dateOperation.toISOString().split('T')[0];
    } else if (typeof operation.dateOperation === 'string') {
      formattedDate = new Date(operation.dateOperation).toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    // Clone the operation to avoid direct references
    this.operation = {
      id: operation.id,
      dateOperation: formattedDate,
      connaissementsCount: operation.connaissementsCount,
      carCount: operation.carCount,
      navire: {
        id: operation.navire?.id,
        name: operation.navire?.name,
        numeroEscale: operation.navire?.numeroEscale
      },
      client: {
        id: operation.client?.id,
        name: operation.client?.name,
        address: operation.client?.address,
        email: operation.client?.email,
        phone: operation.client?.phone
      }
    };

    // Update selected navire display info
    this.onNavireChange();
  }

  cancelEdit(): void {
    this.isEditingOperation = false;
    this.isAddingOperation = false;
    this.errorMessage = '';
    this.showErrorModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.operation = this.createNewOperation();
    this.selectedNavire = null;
    this.errorMessage = '';
    this.showErrorModal = false;
  }

  onNavireChange(): void {
    // When navire changes, find and store the full navire object for display
    if (this.operation.navire?.id) {
      const navire = this.navires.find(n => n.id === this.operation.navire?.id);
      if (navire) {
        this.selectedNavire = navire;
      }
    } else {
      this.selectedNavire = null;
    }
  }

  // Show error in modal popup
  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorModal(): void {
    this.errorMessage = '';
    this.showErrorModal = false;
    // Remove any error query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { error: null, showAddForm: null },
      queryParamsHandling: 'merge'
    });
  }

  // Check if navire is already used in an operation - show error immediately
  checkNavireUsage(): boolean {
    if (!this.operation.navire?.id) return false;

    // Skip this check if we're editing the current operation
    if (this.isEditingOperation && this.operation.id) {
      const currentOperation = this.operations.find(op => op.id === this.operation.id);
      if (currentOperation && currentOperation.navire.id === this.operation.navire.id) {
        return false; // Allow the same navire in the operation being edited
      }
    }

    // Check if the navire is used in any other operation
    const isUsed = this.operations.some(op =>
      op.navire &&
      op.navire.id === this.operation.navire.id &&
      (!this.isEditingOperation || op.id !== this.operation.id)
    );

    if (isUsed) {
      this.showError('Vous ne pouvez pas ajouter le même navire. Ce navire est déjà utilisé dans une autre opération.');
    }

    return isUsed;
  }

  onSubmit(): void {
    console.log('Submitting operation:', this.operation);
    this.errorMessage = '';
    this.showErrorModal = false;

    // Check if navire is already used in another operation
    if (this.checkNavireUsage()) {
      return;
    }

    if (this.isEditingOperation && this.operation.id) {
      this.operationService.update(this.operation.id, this.operation).pipe(
        catchError(err => {
          console.error('Error updating operation:', err);
          // Check if the error is about duplicate navire
          if (err.error && err.error.message && err.error.message.includes('navire')) {
            this.showError('Vous ne pouvez pas utiliser ce navire. Il est déjà associé à une autre opération.');
          }
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          console.log('Operation updated:', response);
          this.loadOperations();
          this.resetForm();
          this.isEditingOperation = false;
          this.isAddingOperation = false;
        }
      });
    } else {
      this.operationService.create(this.operation).pipe(
        catchError(err => {
          console.error('Error creating operation:', err);
          // Check if the error is about duplicate navire
          if (err.error && err.error.message && err.error.message.includes('navire')) {
            this.showError('Vous ne pouvez pas utiliser ce navire. Il est déjà associé à une autre opération.');
          }
          return of(null);
        })
      ).subscribe(response => {
        if (response) {
          console.log('Operation created:', response);
          this.loadOperations();
          this.resetForm();
          this.isAddingOperation = false;
        }
      });
    }
  }

  deleteOperation(id: number | undefined): void {
    if (id === undefined) {
      console.error('Operation ID is undefined');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération?')) {
      this.operationService.delete(id).pipe(
        catchError(err => {
          console.error('Error deleting operation:', err);
          this.showError('Erreur lors de la suppression de l\'opération');
          return of(null);
        })
      ).subscribe(() => {
        console.log('Operation deleted successfully');
        this.loadOperations();
      });
    }
  }
}
