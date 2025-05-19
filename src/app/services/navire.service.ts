import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Navire } from '../models/navire.model';

@Injectable({
  providedIn: 'root'
})
export class NavireService {
  private apiUrl = 'http://localhost:8080/api/navires';
  private refreshNeededSource = new Subject<void>();
  refreshNeeded$ = this.refreshNeededSource.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Navire[]> {
    return this.http.get<Navire[]>(this.apiUrl);
  }

  getById(id: number): Observable<Navire> {
    return this.http.get<Navire>(`${this.apiUrl}/${id}`);
  }

  create(navire: Navire): Observable<Navire> {
    return this.http.post<Navire>(this.apiUrl, navire).pipe(
      tap(() => {
        this.notifyRefresh();
      })
    );
  }

  update(id: number, navire: Navire): Observable<Navire> {
    return this.http.put<Navire>(`${this.apiUrl}/${id}`, navire).pipe(
      tap(() => {
        this.notifyRefresh();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notifyRefresh();
      })
    );
  }

  notifyRefresh(): void {
    console.log('Notifying components to refresh navires');
    this.refreshNeededSource.next();
  }
}
