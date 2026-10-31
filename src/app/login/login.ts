import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email: string = '';
  password: string = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


login() {
  this.errorMessage = '';

  if (!this.email || !this.password) {
    this.errorMessage = 'Enter your email and password.';
    return;
  }

  this.isSubmitting = true;

  this.authService.login(this.email, this.password).subscribe({
    next: (token) => {
      const accessToken = token?.trim();

      if (!accessToken) {
        this.errorMessage = 'Login returned an empty token.';
        this.isSubmitting = false;
        return;
      }

      localStorage.setItem('token', accessToken);
      this.isSubmitting = false;
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Login failed:', error);
      this.errorMessage =
        'Login failed. Check your credentials and backend connection.';
      this.isSubmitting = false;
    },
    complete: () => {
      this.isSubmitting = false;
    }
  });
}
}