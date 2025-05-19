// client-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';
import { Router } from '@angular/router';
import { NgForOf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  standalone: true,
  imports: [
    NgForOf,
    RouterModule
  ],
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
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

  editClient(client: Client): void {
    // Navigate to the add/edit form with the client data
    // This assumes you'll modify client-add component to handle both adding and editing
    this.router.navigate(['/clients/new'], { state: { client: client } });
  }

  deleteClient(id: number | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.delete(id).subscribe({
        next: () => {
          this.clients = this.clients.filter(client => client.id !== id);
        },
        error: (err) => {
          console.error('Error deleting client', err);
        }
      });
    }
  }
}
