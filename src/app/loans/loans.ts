
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loans.html',
  styleUrl: './loans.css'
})
export class Loans implements OnInit {
  loans: any[] = [];
  errorMessage = '';
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });

    this.http.get<any[]>('http://localhost:8080/api/loans', { headers })
      .subscribe({
        next: (data) => {
          this.loans = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Unable to load loans:', error);
          this.errorMessage =
            'Could not load loans. Check your login and backend endpoint.';
          this.loading = false;
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
