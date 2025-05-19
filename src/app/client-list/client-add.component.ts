// client-add.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent implements OnInit {
  client: Client = { name: '', address: '', email: '', phone: '' };
  isEditMode: boolean = false;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {
    // Check if we have client data from router state (edit mode)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { client: Client };

    if (state && state.client) {
      this.client = { ...state.client };
      this.isEditMode = true;
    }
  }

  ngOnInit(): void {
    // Any additional initialization logic
  }

  onSubmit(): void {
    if (this.client.name && this.client.address) {
      if (this.isEditMode && this.client.id) {
        this.clientService.update(this.client.id, this.client).subscribe({
          next: () => {
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error('Error updating client', err);
          }
        });
      } else {
        this.clientService.create(this.client).subscribe({
          next: () => {
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error('Error creating client', err);
          }
        });
      }
    }
  }
}
