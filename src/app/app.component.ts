import { Component } from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import { OrderByPipe } from './shared/pipes/order-by.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent,RouterModule]
})
export class AppComponent {
  title = 'Marsa Maroc';
}
