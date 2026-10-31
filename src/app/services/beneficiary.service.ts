
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Beneficiary {
  id?: number;
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private readonly apiUrl = 'http://localhost:8080/api/beneficiaries';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });
  }

  getAll(): Observable<Beneficiary[]> {
    return this.http.get<Beneficiary[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  add(userId: number, data: Beneficiary): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(
      `${this.apiUrl}/user/${userId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}
