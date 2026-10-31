
import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Account,
  AccountService
} from '../services/account.service';

import { TransactionService } from '../services/transaction.service';

import {
  EMPTY,
  catchError,
  exhaustMap,
  map,
  timeout,
  timer
} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  today = new Date();

  accounts: Account[] = [];
  balance: number | null = null;
  balanceLoaded = false;
  balanceError = '';

  selectedAccountId: number | null = null;

  depositAmount: number | null = null;
  withdrawalAmount: number | null = null;

  transferToAccountId: number | null = null;
  transferAmount: number | null = null;

  transactions: any[] = [];
  transactionsError = '';
  transactionsLoading = false;

  transactionError = '';
  transactionMessage = '';
  isSubmitting = false;

  activeAction = '';
  actionAmount: number | null = null;
  targetAccountId: number | null = null;
  actionMessage = '';

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadTransactions();

    timer(0, 30_000)
      .pipe(
        exhaustMap(() =>
          this.accountService.getAccounts().pipe(
            timeout({ first: 10_000 }),
            map((accounts) => {
              if (
                !Array.isArray(accounts) ||
                accounts.some(
                  account =>
                    !Number.isFinite(Number(account.balance))
                )
              ) {
                throw new Error(
                  'The accounts response has an invalid format.'
                );
              }

              return accounts;
            }),
            catchError((error) => {
              console.error('Failed to load accounts:', error);

              this.balanceError =
                error.status === 401 || error.status === 403
                  ? 'Please sign in again to view your balance.'
                  : 'Unable to load your balance. Please try again.';

              this.balanceLoaded = true;
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((accounts: Account[]) => {
        this.accounts = accounts;
        this.balance = this.calculateTotal(accounts);

        if (
          !accounts.some(
            account => account.id === this.selectedAccountId
          )
        ) {
          this.selectedAccountId = accounts[0]?.id ?? null;
        }

        this.balanceLoaded = true;
        this.balanceError = '';
      });
  }

  loadTransactions(): void {
    this.transactionsLoading = true;
    this.transactionsError = '';

    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = Array.isArray(data) ? data : [];
        this.transactionsLoading = false;
      },
      error: (error) => {
        console.error('Failed to load transactions:', error);

        this.transactionsError =
          error.status === 401 || error.status === 403
            ? 'Please sign in again to view transactions.'
            : 'Unable to load transactions.';

        this.transactionsLoading = false;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  showAction(action: string): void {
    this.activeAction = action;
    this.actionAmount = null;
    this.targetAccountId = null;
    this.actionMessage = '';
    this.transactionError = '';
    this.transactionMessage = '';
  }

  submitAction(): void {
    this.actionMessage = '';

    if (
      this.selectedAccountId === null ||
      this.actionAmount === null ||
      !Number.isFinite(this.actionAmount) ||
      this.actionAmount <= 0
    ) {
      this.actionMessage =
        'Select an account and enter an amount greater than zero.';
      return;
    }

    if (this.activeAction === 'deposit') {
      this.depositAmount = this.actionAmount;
      this.deposit();
    } else if (this.activeAction === 'withdraw') {
      this.withdrawalAmount = this.actionAmount;
      this.withdraw();
    } else if (this.activeAction === 'transfer') {
      if (this.targetAccountId === null) {
        this.actionMessage = 'Select a destination account.';
        return;
      }

      if (this.targetAccountId === this.selectedAccountId) {
        this.actionMessage = 'Choose a different destination account.';
        return;
      }

      this.transferToAccountId = this.targetAccountId;
      this.transferAmount = this.actionAmount;
      this.transfer();
    }
  }

  deposit(): void {
    this.submitBalanceChange('deposit', this.depositAmount);
  }

  withdraw(): void {
    this.submitBalanceChange('withdraw', this.withdrawalAmount);
  }

  private submitBalanceChange(
    action: 'deposit' | 'withdraw',
    amount: number | null
  ): void {
    if (
      this.selectedAccountId === null ||
      amount === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      this.transactionError =
        'Choose an account and enter an amount greater than zero.';
      return;
    }

    this.transactionError = '';
    this.transactionMessage = '';
    this.isSubmitting = true;

    const request =
      action === 'deposit'
        ? this.accountService.deposit(this.selectedAccountId, amount)
        : this.accountService.withdraw(this.selectedAccountId, amount);

    request.subscribe({
      next: (updatedAccount) => {
        this.accounts = this.accounts.map(account =>
          account.id === updatedAccount.id ? updatedAccount : account
        );

        this.balance = this.calculateTotal();
        this.balanceLoaded = true;

        this.depositAmount = null;
        this.withdrawalAmount = null;

        this.transactionMessage =
          action === 'deposit'
            ? 'Deposit completed successfully.'
            : 'Withdrawal completed successfully.';

        this.isSubmitting = false;
        this.loadTransactions();
      },
      error: (error) => {
        console.error(`${action} failed:`, error);

        this.transactionError =
          error.status === 401 || error.status === 403
            ? 'Please sign in again before changing your balance.'
            : error.error?.message ??
              `The ${action} could not be completed. Please try again.`;

        this.isSubmitting = false;
      }
    });
  }

  transfer(): void {
    if (
      this.selectedAccountId === null ||
      this.transferToAccountId === null ||
      this.transferAmount === null ||
      !Number.isFinite(this.transferAmount) ||
      this.transferAmount <= 0
    ) {
      this.transactionError =
        'Select both accounts and enter an amount greater than zero.';
      return;
    }

    if (this.selectedAccountId === this.transferToAccountId) {
      this.transactionError =
        'From and To accounts must be different.';
      return;
    }

    this.transactionError = '';
    this.transactionMessage = '';
    this.isSubmitting = true;

    this.accountService.transfer(
      this.selectedAccountId,
      this.transferToAccountId,
      this.transferAmount
    ).subscribe({
      next: () => {
        this.transactionMessage = 'Transfer completed successfully.';
        this.transferAmount = null;
        this.isSubmitting = false;

        this.accountService.getAccounts().subscribe({
          next: (accounts) => {
            this.accounts = accounts;
            this.balance = this.calculateTotal(accounts);
            this.balanceLoaded = true;

            if (
              !accounts.some(
                account => account.id === this.selectedAccountId
              )
            ) {
              this.selectedAccountId = accounts[0]?.id ?? null;
            }
          },
          error: (error) => {
            console.error('Failed to refresh accounts:', error);
          }
        });

        this.loadTransactions();
      },
      error: (error) => {
        console.error('Transfer failed:', error);

        this.transactionError =
          error.status === 401 || error.status === 403
            ? 'Please sign in again before transferring money.'
            : error.error?.message ?? 'Transfer failed. Please try again.';

        this.isSubmitting = false;
      }
    });
  }

  calculateTotal(accounts: Account[] = this.accounts): number {
    return accounts.reduce(
      (total, account) => total + Number(account.balance),
      0
    );
  }
}
