import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { Position } from '../models/position.model';
import { catchError, map, tap, retry } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private apiUrl = 'http://localhost:8080/api/positions';

  // Subject to notify components when positions change
  private positionsUpdated = new BehaviorSubject<boolean>(false);
  public positionsUpdated$ = this.positionsUpdated.asObservable();

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      })
    };
  }

  getAvailablePositions(): Observable<Position[]> {
    console.log('Fetching available positions');
    return this.http.get<Position[]>(`${this.apiUrl}/available`, this.getHttpOptions()).pipe(
      retry(1), // Retry once on failure
      map(positions => {
        console.log('Available positions:', positions);
        return positions.sort((a, b) =>
          a.niveau - b.niveau || a.x - b.x || a.y - b.y);
      }),
      catchError(this.handleError)
    );
  }

  getAllPositions(): Observable<Position[]> {
    console.log('Fetching all positions');
    return this.http.get<Position[]>(this.apiUrl, this.getHttpOptions()).pipe(
      retry(1), // Retry once on failure
      map(positions => {
        console.log('All positions:', positions);
        return positions.sort((a, b) =>
          a.niveau - b.niveau || a.x - b.x || a.y - b.y);
      }),
      catchError(this.handleError)
    );
  }

  assignPosition(vehiculeId: number): Observable<Position> {
    console.log(`Assigning position to vehicle ID: ${vehiculeId}`);

    return this.http.post<Position>(
      `${this.apiUrl}/assign/${vehiculeId}`,
      {},
      this.getHttpOptions()
    ).pipe(
      retry(1), // Retry once on failure
      tap(position => {
        console.log('Position assigned successfully:', position);
        // Notify subscribers that positions have been updated
        this.positionsUpdated.next(true);
      }),
      catchError(error => {
        console.error('Error assigning position:', error);
        return this.handleError(error);
      })
    );
  }

  getVehiclePosition(vehiculeId: number): Observable<Position | null> {
    console.log(`Getting position for vehicle ID: ${vehiculeId}`);

    return this.http.get<Position>(
      `${this.apiUrl}/vehicle/${vehiculeId}`,
      this.getHttpOptions()
    ).pipe(
      tap(position => {
        if (position) {
          console.log('Found position for vehicle:', position);
        } else {
          console.log('No position found for this vehicle');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.log('No position found for this vehicle (404)');
          return of(null);
        }
        return this.handleError(error);
      })
    );
  }

  updatePosition(position: Position): Observable<Position> {
    console.log(`Updating position ID: ${position.id}`, position);

    return this.http.put<Position>(
      `${this.apiUrl}/${position.id}`,
      position,
      this.getHttpOptions()
    ).pipe(
      retry(1), // Retry once on failure
      tap(updatedPosition => {
        console.log('Position updated successfully:', updatedPosition);
        // Notify subscribers that positions have been updated
        this.positionsUpdated.next(true);
      }),
      catchError(error => {
        console.error('Error updating position:', error);
        return this.handleError(error);
      })
    );
  }

  releasePosition(positionId: number): Observable<any> {
    console.log(`Releasing position ID: ${positionId}`);

    return this.http.post<any>(
      `${this.apiUrl}/release/${positionId}`,
      {},
      this.getHttpOptions()
    ).pipe(
      retry(1), // Retry once on failure
      tap(response => {
        console.log('Position released successfully:', response);
        // Notify subscribers that positions have been updated
        this.positionsUpdated.next(true);
      }),
      catchError(error => {
        console.error('Error releasing position:', error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Log error for debugging
    console.error('API Error:', error);

    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;

      switch (error.status) {
        case 0:
          errorMessage = 'Serveur inaccessible. Vérifiez votre connexion internet.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 409:
          errorMessage = 'Conflit: Cette ressource est peut-être déjà utilisée.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
      }

      // Add more details if available
      if (error.error?.message) {
        errorMessage += `\nDétails: ${error.error.message}`;
      }
    }

    // Return a more detailed error
    return throwError(() => new Error(errorMessage));
  }
}
