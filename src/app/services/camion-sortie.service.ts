// src/app/services/camion-sortie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { CamionSortie } from '../models/CamionSortie.model';
import { CamionSortieCreation } from '../models/camion-sortie-creation.model';
import { Vehicule } from '../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class CamionSortieService {
  private apiUrl = 'http://localhost:8080/api/camions-sortie';

  constructor(private http: HttpClient) { }

  // Récupérer tous les camions de sortie
  getAllCamionsSortie(): Observable<CamionSortie[]> {
    return this.http.get<CamionSortie[]>(this.apiUrl).pipe(
      tap(() => console.log('Liste des camions de sortie récupérée')),
      catchError(error => {
        console.error('Erreur récupération liste camions:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la récupération des camions'));
      })
    );
  }

  // Récupérer un camion par son ID
  getCamionSortieById(id: number): Observable<CamionSortie> {
    return this.http.get<CamionSortie>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('Camion récupéré:', response)),
      catchError(error => {
        console.error('Erreur récupération camion:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la récupération du camion'));
      })
    );
  }

  // Créer un nouveau camion de sortie
  createCamionSortie(camion: CamionSortieCreation): Observable<CamionSortie> {
    return this.http.post<CamionSortie>(this.apiUrl, camion).pipe(
      tap(response => console.log('Camion créé:', response)),
      catchError(error => {
        console.error('Erreur création camion:', error);
        let errorMessage = 'Erreur lors de la création du camion';
        if (error.status === 0) {
          errorMessage = 'Connexion au serveur impossible';
        } else if (error.error) {
          errorMessage = error.error;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Mettre à jour un camion de sortie
  updateCamionSortie(id: number, camion: CamionSortieCreation): Observable<CamionSortie> {
    return this.http.put<CamionSortie>(`${this.apiUrl}/${id}`, camion).pipe(
      tap(response => console.log('Camion mis à jour:', response)),
      catchError(error => {
        console.error('Erreur mise à jour camion:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la mise à jour du camion'));
      })
    );
  }

  // Supprimer un camion de sortie
  deleteCamionSortie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Camion supprimé')),
      catchError(error => {
        console.error('Erreur suppression camion:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de la suppression du camion'));
      })
    );
  }

  // Ajouter un véhicule à un camion
  ajouterVehiculeAuCamion(camionId: number, vehiculeId: number): Observable<Vehicule> {
    return this.http.post<Vehicule>(`${this.apiUrl}/${camionId}/vehicules/${vehiculeId}`, {}).pipe(
      tap(response => console.log('Véhicule ajouté au camion:', response)),
      catchError(error => {
        console.error('Erreur ajout véhicule:', error);
        return throwError(() => new Error(error.message || 'Erreur lors de l\'ajout du véhicule'));
      })
    );
  }

  // Retirer un véhicule d'un camion
  retirerVehiculeDuCamion(camionId: number, vehiculeId: number): Observable<Vehicule> {
    return this.http.delete<Vehicule>(`${this.apiUrl}/${camionId}/vehicules/${vehiculeId}`).pipe(
      tap(response => console.log('Véhicule retiré du camion:', response)),
      catchError(error => {
        console.error('Erreur retrait véhicule:', error);
        return throwError(() => new Error(error.message || 'Erreur lors du retrait du véhicule'));
      })
    );
  }
}
