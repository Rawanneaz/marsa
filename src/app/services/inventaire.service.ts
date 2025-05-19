import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, TimeoutError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, timeout, retry } from 'rxjs/operators';
import { Inventaire, InventaireCreation } from '../models/inventaire.model';

@Injectable({
  providedIn: 'root'
})
export class InventaireService {
  private apiUrl = 'http://localhost:8080/api/inventaires';
  private requestTimeout = 15000;

  // Add a subject to track inventory updates
  private inventoriesUpdated = new BehaviorSubject<boolean>(false);
  public inventoriesUpdated$ = this.inventoriesUpdated.asObservable();

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      })
    };
  }

  createInventaire(inventaire: InventaireCreation): Observable<Inventaire> {
    console.log('Creating inventory:', inventaire);
    return this.http.post<Inventaire>(this.apiUrl, inventaire, this.getHttpOptions()).pipe(
      timeout(this.requestTimeout),
      tap(response => {
        console.log('Create inventory response:', response);
        // Notify subscribers that inventories have been updated
        this.inventoriesUpdated.next(true);
      }),
      catchError(this.handleError)
    );
  }

  getInventairesByVehicule(vehiculeId: number): Observable<Inventaire[]> {
    console.log(`Loading inventories for vehicle ID: ${vehiculeId}`);
    return this.http.get<any[]>(`${this.apiUrl}/vehicule/${vehiculeId}`, this.getHttpOptions()).pipe(
      timeout(this.requestTimeout),
      retry(1), // Retry once if there's an error
      tap(response => console.log('Inventories response:', response)),
      map(response => {
        if (!response || !Array.isArray(response)) {
          console.warn('API returned invalid data for inventories:', response);
          return [];
        }

        return response
          .filter(item => item != null)
          .map(item => this.transformInventaire(item))
          .filter((item): item is Inventaire => item !== null);
      }),
      catchError(error => {
        console.error(`Error loading inventories for vehicle ${vehiculeId}:`, error);
        return this.handleError(error);
      })
    );
  }

  getInventaireById(id: number): Observable<Inventaire | null> {
    console.log(`Loading inventory with ID: ${id}`);

    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions()).pipe(
      timeout(this.requestTimeout),
      retry(1), // Retry once if there's an error
      tap(response => {
        console.log('Inventory detail response:', response);
        // Log the structure to debug
        if (response) {
          console.log('Response structure:', Object.keys(response));
          if (response.position) {
            console.log('Position structure:', Object.keys(response.position));
          }
        }
      }),
      map(inventaire => this.transformInventaire(inventaire)),
      catchError(error => {
        console.error(`Error loading inventory with ID ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  getDernierInventaireByVehicule(vehiculeId: number): Observable<Inventaire | null> {
    console.log(`Loading latest inventory for vehicle ID: ${vehiculeId}`);
    return this.http.get<any>(`${this.apiUrl}/dernier/vehicule/${vehiculeId}`, this.getHttpOptions()).pipe(
      timeout(this.requestTimeout),
      retry(1), // Retry once if there's an error
      tap(response => console.log('Latest inventory response:', response)),
      map(inventaire => this.transformInventaire(inventaire)),
      catchError(error => {
        console.error(`Error loading latest inventory for vehicle ${vehiculeId}:`, error);
        return this.handleError(error);
      })
    );
  }

  // Method to manually refresh the inventories
  refreshInventories(): void {
    this.inventoriesUpdated.next(true);
  }

  private transformInventaire(inventaire: any): Inventaire | null {
    if (!inventaire) return null;

    try {
      // Enhanced position handling
      let position = undefined;

      if (inventaire.position) {
        position = {
          id: inventaire.position.id,
          niveau: inventaire.position.niveau || 1,
          x: inventaire.position.x || 0,
          y: inventaire.position.y || 0,
          statut: inventaire.position.statut || 'INCONNU',
          vehiculeId: inventaire.position.vehiculeId,
          vehiculeNumeroIdentification: inventaire.position.vehiculeNumeroIdentification
        };

        console.log('Transformed position data:', position);
      }

      return {
        id: inventaire.id,
        vehiculeId: inventaire.vehiculeId,
        dateCreation: new Date(inventaire.dateCreation),
        notesGenerales: inventaire.notesGenerales || '',
        degats: Array.isArray(inventaire.degats) ? inventaire.degats : [],
        accessoires: Array.isArray(inventaire.accessoires) ? inventaire.accessoires : [],
        position: position
      };
    } catch (error) {
      console.error('Error transforming inventory data:', error);
      console.error('Problematic inventory data:', inventaire);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';

    // Handle specific error types
    if (error instanceof TimeoutError) {
      errorMessage = 'Request timed out. The server is taking too long to respond.';
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your network connection.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found. The API endpoint may be incorrect.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error?.message) {
          errorMessage += `\nServer Message: ${error.error.message}`;
        }
      }
    }

    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
