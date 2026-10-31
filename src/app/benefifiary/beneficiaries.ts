
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Beneficiary,
  BeneficiaryService
} from '../services/beneficiary.service';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './beneficiaries.html',
  styleUrl: './beneficiaries.css'
})
export class Beneficiaries implements OnInit {
  beneficiaries: Beneficiary[] = [];

  userId: number | null = null;
  beneficiaryName = '';
  accountNumber = '';
  bankName = '';
  ifscCode = '';

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private beneficiaryService: BeneficiaryService) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    this.loading = true;
    this.errorMessage = '';

    this.beneficiaryService.getAll().subscribe({
      next: (data) => {
        this.beneficiaries = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Loading beneficiaries failed:', error);
        this.errorMessage =
          'Could not load beneficiaries. Check your login and backend.';
        this.loading = false;
      }
    });
  }

  addBeneficiary(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.userId === null ||
      !Number.isInteger(this.userId) ||
      this.userId <= 0 ||
      !this.beneficiaryName.trim() ||
      !this.accountNumber.trim() ||
      !this.bankName.trim() ||
      !this.ifscCode.trim()
    ) {
      this.errorMessage = 'Please complete all fields with a valid user ID.';
      return;
    }

    const data: Beneficiary = {
      beneficiaryName: this.beneficiaryName.trim(),
      accountNumber: this.accountNumber.trim(),
      bankName: this.bankName.trim(),
      ifscCode: this.ifscCode.trim().toUpperCase()
    };

    this.saving = true;

    this.beneficiaryService.add(this.userId, data).subscribe({
      next: () => {
        this.successMessage = 'Beneficiary added successfully.';
        this.beneficiaryName = '';
        this.accountNumber = '';
        this.bankName = '';
        this.ifscCode = '';
        this.saving = false;
        this.loadBeneficiaries();
      },
      error: (error: any) => {
        console.error('Adding beneficiary failed:', error);
        this.errorMessage =
          error.error?.message ??
          'Could not add beneficiary. Check the user ID and try again.';
        this.saving = false;
      }
    });
  }

  deleteBeneficiary(id?: number): void {
    if (id == null || !confirm('Delete this beneficiary?')) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.beneficiaryService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Beneficiary deleted successfully.';
        this.loadBeneficiaries();
      },
      error: (error: any) => {
        console.error('Deleting beneficiary failed:', error);
        this.errorMessage = 'Could not delete this beneficiary.';
      }
    });
  }
}
