
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Account, AccountService } from '../services/account.service';
import { BillPayment, BillService } from '../services/bill.service';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './bills.html',
  styleUrl: './bills.css'
})
export class Bills implements OnInit {
  accounts: Account[] = [];
  bills: BillPayment[] = [];

  accountId: number | null = null;
  billType = 'Electricity';
  billNumber = '';
  amount: number | null = null;

  loading = false;
  paying = false;
  errorMessage = '';
  successMessage = '';

  readonly billTypes = [
    'Electricity',
    'Water',
    'Gas',
    'Internet',
    'Mobile',
    'Other'
  ];

  constructor(
    private accountService: AccountService,
    private billService: BillService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadBills();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data: Account[]) => {
        this.accounts = data;
        if (
          this.accountId === null &&
          this.accounts.length > 0
        ) {
          this.accountId = this.accounts[0].id;
        }
      },
      error: (error: any) => {
        console.error('Loading accounts failed:', error);
        this.errorMessage = 'Could not load your accounts.';
      }
    });
  }

  loadBills(): void {
    this.loading = true;

    this.billService.getAll().subscribe({
      next: (data: BillPayment[]) => {
        this.bills = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Loading bills failed:', error);
        this.loading = false;
        this.errorMessage =
          'Could not load payment history. Check your login and backend.';
      }
    });
  }

  payBill(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      this.accountId === null ||
      this.billNumber.trim() === '' ||
      this.amount === null ||
      !Number.isFinite(this.amount) ||
      this.amount <= 0
    ) {
      this.errorMessage =
        'Select an account and enter a bill number and amount greater than zero.';
      return;
    }

    this.paying = true;

    const bill: BillPayment = {
      billType: this.billType,
      billNumber: this.billNumber.trim(),
      amount: this.amount
    };

    this.billService.pay(this.accountId, bill).subscribe({
      next: (result: BillPayment) => {
        this.successMessage =
          `Bill payment successful${result.id ? ` (Payment ID: ${result.id})` : ''}.`;
        this.billNumber = '';
        this.amount = null;
        this.paying = false;
        this.loadBills();
        this.loadAccounts();
      },
      error: (error: any) => {
        console.error('Bill payment failed:', error);
        this.errorMessage =
          error.error?.message ??
          (typeof error.error === 'string' ? error.error : null) ??
          'Bill payment failed. Check your account balance and try again.';
        this.paying = false;
      }
    });
  }
}
