import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Vehicule } from '../models/vehicule.model';
import { VehiculeArrivee } from '../models/vehiculeArrivee.model';
import { ArrivalDto } from '../models/arrival.dto';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  // Base URL for all vehicle API calls
  private apiUrl = 'http://localhost:8080/api/vehicules';

  constructor(private http: HttpClient) { }

  // Standard vehicle methods
  getVehiculeById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Véhicule récupéré:', response)),
      catchError(error => {
        console.error('Erreur récupération véhicule:', error);
        throw error;
      })
    );
  }

  getVehiculeByNumeroIdentification(numeroIdentification: string): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/numero/${numeroIdentification}`).pipe(
      tap(response => console.log('Véhicule récupéré par numéro:', response)),
      catchError(error => {
        console.error('Erreur récupération véhicule par numéro:', error);
        throw error;
      })
    );
  }

  getAllVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.apiUrl).pipe(
      tap(() => console.log('Liste des véhicules récupérée')),
      // Map response to ensure all objects have required properties
      // This helps prevent TypeScript errors
      map((vehicles: any[]) => {
        return vehicles.map(v => ({
          id: v.id || 0, // Ensure id is always a number, never undefined
          numeroIdentification: v.numeroIdentification || '',
          dateArrivee: v.dateArrivee ? new Date(v.dateArrivee) : new Date(),
          statut: v.statut || 'INCONNU',
          marque: v.marque || '',
          modele: v.modele || '',
          immatriculation: v.immatriculation || '',
          couleur: v.couleur || undefined,
          emplacementLot: v.emplacementLot || undefined,
          notes: v.notes || undefined,
          transporteur: v.transporteur || undefined,
          photoUrl: v.photoUrl || undefined
        }));
      }),
      catchError(error => {
        console.error('Erreur récupération liste véhicules:', error);
        throw error;
      })
    );
  }


  getVehiculesByStatut(statut: string): Observable<Vehicule[]> {
    // Normalize the status to handle both 'GARE' and 'GARÉE'
    const normalizedStatut = statut.toUpperCase() === 'GARE' ? 'GARÉE' :
      statut.toUpperCase() === 'GARÉE' ? 'GARÉE' :
        statut;

    return this.http.get<Vehicule[]>(`${this.apiUrl}/statut/${normalizedStatut}`).pipe(
      tap(vehicles => {
        console.log('Véhicules récupérés:', vehicles);
        console.log('Nombre de véhicules:', vehicles.length);
        console.log('Statuts des véhicules:', vehicles.map(v => v.statut));
      }),
      map((vehicles: any[]) => {
        return vehicles.map(v => ({
          id: v.id || 0,
          numeroIdentification: v.numeroIdentification || '',
          dateArrivee: v.dateArrivee ? new Date(v.dateArrivee) : new Date(),
          statut: v.statut || 'INCONNU',
          marque: v.marque || '',
          modele: v.modele || '',
          immatriculation: v.immatriculation || '',
          couleur: v.couleur || undefined,
          emplacementLot: v.emplacementLot || undefined,
          notes: v.notes || undefined,
          transporteur: v.transporteur || undefined,
          photoUrl: v.photoUrl || undefined
        }));
      }),
      catchError(error => {
        console.error('Erreur détaillée lors de la récupération des véhicules:', error);
        console.error('URL appelée:', `${this.apiUrl}/statut/${normalizedStatut}`);
        console.error('Type d\'erreur:', error.name);
        console.error('Message d\'erreur:', error.message);

        // Affichez les détails de la requête si possible
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          console.error('Erreur côté client:', error.error.message);
        } else {
          // Erreur côté serveur
          console.error(`Code d'erreur ${error.status}`);
          console.error('Corps de l\'erreur:', error.error);
        }

        return throwError(() => new Error('Impossible de charger les véhicules'));
      })
    );
  }

  getAllVehiculesArrivee(): Observable<VehiculeArrivee[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(() => console.log('Liste des véhicules d\'arrivée récupérée')),
      // Explicitly map and filter to ensure type safety
      map(vehicles => {
        return vehicles
          .filter(v => v.id !== undefined && v.id !== null)
          .map(v => ({
            id: v.id,
            numeroIdentification: v.numeroIdentification || '',
            dateArrivee: v.dateArrivee ? new Date(v.dateArrivee) : new Date(),
            statut: v.statut || 'ARRIVÉ',
            marque: v.marque || '',
            modele: v.modele || '',
            immatriculation: v.immatriculation || '',
            annee: v.annee || undefined,
            couleur: v.couleur || undefined,
            emplacementLot: v.emplacementLot || undefined,
            notes: v.notes || undefined,
            transporteur: v.transporteur || undefined,
            photoUrl: v.photoUrl || undefined
          }));
      }),
      catchError(error => {
        console.error('Erreur récupération liste véhicules d\'arrivée:', error);
        throw error;
      })
    );
  }

  getVehiculeArriveeById(id: number): Observable<VehiculeArrivee> {
    return this.http.get<VehiculeArrivee>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Véhicule d\'arrivée récupéré:', response)),
      catchError(error => {
        console.error('Erreur récupération véhicule d\'arrivée:', error);
        throw error;
      })
    );
  }

  getVehiculeArriveeByNumeroIdentification(numeroIdentification: string): Observable<VehiculeArrivee> {
    return this.http.get<VehiculeArrivee>(`${this.apiUrl}/numero/${numeroIdentification}`).pipe(
      tap(response => console.log('Véhicule d\'arrivée récupéré par numéro:', response)),
      catchError(error => {
        console.error('Erreur récupération véhicule d\'arrivée par numéro:', error);
        throw error;
      })
    );
  }

  // Register arrival - Updated to use the correct endpoint and fix TS7006 error
  enregistrerArrivee(data: ArrivalDto): Observable<VehiculeArrivee> {
    return this.http.post<VehiculeArrivee>(`${this.apiUrl}/arrivee`, data).pipe(
      tap(response => console.log('Enregistrement arrivée réussi:', response)),
      catchError(error => {
        console.error('Erreur API:', error);
        let errorMessage = 'Erreur serveur';
        if (error.status === 0) {
          errorMessage = 'Connexion au serveur impossible';
        } else if (error.status === 409) {
          errorMessage = 'Ce numéro existe déjà';
        } else if (error.status === 400) {
          // Handle validation errors
          errorMessage = error.error || 'Données invalides';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  updateStatut(id: number, statut: string): Observable<Vehicule> {
    return this.http.patch<Vehicule>(`${this.apiUrl}/${id}/statut`, null, {
      params: { nouveauStatut: statut }
    }).pipe(
      tap(response => console.log('Statut mis à jour:', response)),
      catchError(error => {
        console.error('Erreur mise à jour statut:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la mise à jour du statut'));
      })
    );
  }
  updateVehiculeStatus(vehiculeId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${vehiculeId}/status`, { status }).pipe(
      tap(response => console.log('Statut mis à jour (méthode alternative):', response)),
      catchError(error => {
        console.error('Erreur mise à jour statut (méthode alternative):', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la mise à jour du statut'));
      })
    );
  }
}
