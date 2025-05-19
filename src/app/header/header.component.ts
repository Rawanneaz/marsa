// header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  logoPath = '/assets/logo.png';
}
