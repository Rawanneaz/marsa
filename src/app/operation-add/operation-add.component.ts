import { Component, OnInit } from '@angular/core';
import { OperationService } from '../services/operation.service';
import { Operation } from '../models/operation.model';
import { NavireService } from '../services/navire.service';
import { Navire } from '../models/navire.model';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operation-add',
  templateUrl: './operation-add.component.html',
  standalone: true,
  styleUrls: ['./operation-add.component.css'],
  imports: [CommonModule, FormsModule]
})
export class OperationAddComponent implements OnInit {
  operation: Operation = {
    dateOperation: new Date(),
    connaissementsCount: 0,
    carCount: 0,
    navire: { id: undefined },
    client: { id: undefined }
  };
  navires: Navire[] = [];
  clients: Client[] = [];

  constructor(
    private operationService: OperationService,
    private navireService: NavireService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNavires();
    this.loadClients();
  }

  loadNavires(): void {
    this.navireService.getAll().subscribe({
      next: (navires) => {
        this.navires = navires;
      },
      error: (err) => {
        console.error('Error fetching navires', err);
      }
    });
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        console.error('Error fetching clients', err);
      }
    });
  }

  onSubmit(): void {
    console.log('Submit button clicked');
    console.log('Operation data:', this.operation);

    this.operationService.create(this.operation).subscribe({
      next: (result) => {
        console.log('Success response:', result);
        // Navigate and force reload to ensure list is updated
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/operations']);
        });
      },
      error: (err) => {
        console.error('Error response:', err);
      }
    });
  }
}
