
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './investments.html',
  styleUrl: './investments.css'
})
export class Investments implements OnInit {
  investments: any[] = [];
  errorMessage = '';
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInvestments();
  }

  loadInvestments(): void {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });

    this.http
      .get<any[]>('http://localhost:8080/api/investments', { headers })
      .subscribe({
        next: (data) => {
          this.investments = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Unable to load investments:', error);
          this.errorMessage =
            'Could not load investments. Check your login and backend endpoint.';
          this.loading = false;
        }
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
