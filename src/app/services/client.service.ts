import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) { }

  // Method to get all clients (renamed to match the usage in components)
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  // Alternative method name for backward compatibility
  getAll(): Observable<Client[]> {
    return this.getAllClients();
  }

  // Method to create a new client
  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  // Method to update a client
  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  // Method to get a client by ID
  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  // Method to delete a client by ID
  delete(id: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
