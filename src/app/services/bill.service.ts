
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BillPayment {
  id?: number;
  billType: string;
  billNumber: string;
  amount: number;
  status?: string;
  paymentDate?: string;
  account?: {
    id?: number;
    accountNumber?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private readonly apiUrl = 'http://localhost:8080/api/bills';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });
  }

  getAll(): Observable<BillPayment[]> {
    return this.http.get<BillPayment[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  pay(accountId: number, bill: BillPayment): Observable<BillPayment> {
    return this.http.post<BillPayment>(
      `${this.apiUrl}/account/${accountId}`,
      {
        billType: bill.billType,
        billNumber: bill.billNumber,
        amount: bill.amount
      },
      { headers: this.getHeaders() }
    );
  }
}
