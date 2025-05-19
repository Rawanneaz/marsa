import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule, FormsModule]  // Import necessary modules like FormsModule and CommonModule
})
export class FooterComponent {
  // Footer logic here if needed
}
