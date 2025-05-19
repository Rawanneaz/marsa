import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  // Subject to notify about position highlighting requests
  private positionHighlightSource = new Subject<string>();
  public positionHighlight$ = this.positionHighlightSource.asObservable();

  // Request highlighting a specific position
  highlightPosition(positionId: string): void {
    this.positionHighlightSource.next(positionId);
  }
}
