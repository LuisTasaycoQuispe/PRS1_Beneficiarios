import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { Person } from '../interfaces/person';
import { environment } from '../../environments/environments';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {

  private personUrl = `${environment.ms_person}/api/v1/person`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private withAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getToken()).pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });
        return from([headers]);
      })
    );
  }

  getPersons(): Observable<Person[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Person[]>(`${this.personUrl}/active`, { headers })
      )
    );
  }

  getPersonsWithNullFamilyId(): Observable<Person[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Person[]>(`${this.personUrl}/with-null-family-id`, {
          headers,
        })
      )
    );
  }

  createPerson(person: Person): Observable<Person> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<Person>(this.personUrl, person, { headers })
      )
    );
  }

  createPersons(persons: Person[]): Observable<Person[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.post<Person[]>(this.personUrl, persons, { headers })
      )
    );
  }

  updatePerson(id: number, person: Person): Observable<Person> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.put<Person>(`${this.personUrl}/${id}`, person, { headers })
      )
    );
  }

  // Método específico para actualizar el ID de familia
  assignFamilyToPersons(familyId: number): Observable<Person[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.put<Person[]>(
          `${this.personUrl}/assign-family/${familyId}`,
          {},
          { headers }
        )
      )
    );
  }

  getPersonsByFamilyId(familyId: number): Observable<Person[]> {
    return this.withAuthHeaders().pipe(
      switchMap((headers) =>
        this.http
          .get<Person[]>(`${this.personUrl}/family/${familyId}`, { headers })
          .pipe(map((response) => response || []))
      )
    );
  }
}
