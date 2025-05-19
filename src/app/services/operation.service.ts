import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Operation } from '../models/operation.model';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private apiUrl = 'http://localhost:8080/api/operations';

  constructor(private http: HttpClient) { }

  // Récupérer toutes les opérations
  getAll(): Observable<Operation[]> {
    return this.http.get<Operation[]>(this.apiUrl).pipe(
      tap(operations => {
        // Ensure dates are properly parsed
        operations.forEach(op => {
          if (op.dateOperation && typeof op.dateOperation === 'string') {
            op.dateOperation = new Date(op.dateOperation);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  // Récupérer une opération par ID
  get(id: number): Observable<Operation> {
    return this.http.get<Operation>(`${this.apiUrl}/${id}`).pipe(
      tap(operation => {
        // Ensure date is properly parsed
        if (operation.dateOperation && typeof operation.dateOperation === 'string') {
          operation.dateOperation = new Date(operation.dateOperation);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Créer une nouvelle opération
  create(operation: Operation): Observable<any> {
    console.log('Service create method called with:', operation);

    // Create a copy to avoid modifying the original
    const operationToSend = this.prepareOperationData(operation);

    return this.http.post<any>(this.apiUrl, operationToSend).pipe(
      tap(result => console.log('Service received response:', result)),
      catchError(this.handleErrorWithMessage)
    );
  }

  // Mettre à jour une opération
  update(id: number, operation: Operation): Observable<any> {
    // Create a copy to avoid modifying the original
    const operationToSend = this.prepareOperationData(operation);

    return this.http.put<any>(`${this.apiUrl}/${id}`, operationToSend).pipe(
      catchError(this.handleErrorWithMessage)
    );
  }

  // Supprimer une opération
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Helper to prepare operation data for sending to the API
  private prepareOperationData(operation: Operation): any {
    const operationCopy = { ...operation };

    // Ensure correct date format for backend
    if (operationCopy.dateOperation) {
      if (typeof operationCopy.dateOperation === 'string') {
        // If it's already a string, make sure it's in the correct format
        const date = new Date(operationCopy.dateOperation);
        operationCopy.dateOperation = date;
      }
    }

    // Ensure navire and client objects only contain their IDs
    if (operationCopy.navire && operationCopy.navire.id) {
      operationCopy.navire = { id: operationCopy.navire.id };
    }

    if (operationCopy.client && operationCopy.client.id) {
      operationCopy.client = { id: operationCopy.client.id };
    }

    return operationCopy;
  }

  // Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Error handling that preserves server message
  private handleErrorWithMessage(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      if (typeof error.error === 'string') {
        // If server returned a string error message
        errorMessage = error.error;
      } else {
        errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
