import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'http://localhost:8080/api/accounts';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any[]> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any[]>(
      this.apiUrl,
      { headers }
    );
  }

  deposit(accountId: number, amount: number): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('amount', amount.toString());

    return this.http.post(
      `http://localhost:8080/api/banking/deposit/${accountId}`,
      null,
      {
        headers,
        params
      }
    );
  }

      withdraw(accountId: number, amount: number): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('amount', amount.toString());

    return this.http.post(
      `http://localhost:8080/api/banking/withdraw/${accountId}`,
      null,
      {
        headers,
        params
      }
    );
  }

  transfer(
    fromAccountId: number,
    toAccountId: number,
    amount: number
  ): Observable<any> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('toAccountId', toAccountId.toString())
      .set('amount', amount.toString());

    return this.http.post(
      `http://localhost:8080/api/banking/transfer/${fromAccountId}`,
      null,
      {
        headers,
        params
      }
    );
  }
}