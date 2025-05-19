import { Component } from '@angular/core';
import { NavireService } from '../services/navire.service';
import { Navire } from '../models/navire.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navire-add',
  templateUrl: './navire-add.component.html',
  standalone: true,
  styleUrls: ['./navire-add.component.css'],
  imports: [CommonModule, FormsModule]
})
export class NavireAddComponent {
  navire: Navire = { name: '', numeroEscale: '' }; // Initialize navire model

  constructor(
    private navireService: NavireService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.navireService.create(this.navire).subscribe({
      next: () => {
        this.navireService.notifyRefresh();  // Add this line to notify about the refresh
        this.router.navigate(['/navires']);
      },
      error: (err) => {
        console.error('Error adding navire:', err);
      }
    });
  }
}
