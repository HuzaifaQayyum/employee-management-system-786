import { SocketService } from './../../../services/socket.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ErrorService } from './../../../services/Error.service';
import { AdminService } from './../../../services/admin.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Account } from '../../../models/Account.model';

@Component({
    templateUrl: './account-management.component.html',
    styleUrls: ['./account-management.component.css']
})
export class AccountsManagementComponent implements OnInit, OnDestroy {
    accounts: Account[] = [];
    isLoading = true;
    isServerError?: boolean;
    serverMsg?: string;
    private subscriptions: Subscription[] = [];
    newAccounts: Account[] = [];
    filteredAccounts: Account[] = [];
    isQuerying = false;
    totalNoOfPages: number;
    currentPageNo = 1;
    isLoadingMoreDocuments: boolean;

    constructor(private adminService: AdminService, private errorService: ErrorService, private socketService: SocketService) { }

    ngOnInit(): void {
        this.adminService.fetchAccounts()
            .subscribe(accounts => {
                this.isLoading = false;
                this.errorService.handle404(accounts);

                this.accounts = accounts;
            });


        this.adminService.fetchTotalPagesOfAccounts()
            .subscribe(({ pages }) => this.totalNoOfPages = pages);

        // Subscribing to error event
        const subsciption = this.errorService.onPageErrorAlert.subscribe(({ isServerError, msg }) => {
            this.isServerError = isServerError;
            this.serverMsg = msg;

            if (this.isLoading) this.isLoading = false;
        });

        this.subscriptions.push(subsciption);

        // Realtime support
        this.socketService.connection.on('new-account', this.onNewAccountEvent.bind(this));
        this.socketService.connection.on('update-account', this.onUpdateAccountEvent.bind(this));
        this.socketService.connection.on('delete-account', this.onDeleteAccountEvent.bind(this));
    }

    private onDeleteAccountEvent(account: Account): void {
        const deletedAccount = this.accounts.find(e => e._id === account._id) || this.newAccounts.find(e => e._id === account._id);
        if (deletedAccount) deletedAccount.deleted = true;
    }


    private onNewAccountEvent(account: Account): void {
        this.newAccounts.push(account);
    }

    private onUpdateAccountEvent(account: Account): void {
        const updatedAccountIndex = this.accounts.findIndex(e => e._id === account._id);
        if (updatedAccountIndex > -1) {
            this.accounts[updatedAccountIndex] = { ...account, updated: true };
            return;
        }

        const updatedAcccountindexInNewEntries = this.newAccounts.findIndex(e => e._id === account._id);
        if (updatedAcccountindexInNewEntries > -1) this.newAccounts[updatedAcccountindexInNewEntries] = { ...account, updated: true };
    }

    loadMoreAccounts(): void { 
        this.isLoadingMoreDocuments = true;
        this.adminService.fetchAccounts(this.currentPageNo)
            .subscribe(accounts => { 
                this.accounts.push(...accounts);
                this.currentPageNo++;
                this.isLoadingMoreDocuments = false;
            });
    }

    updateAccountsArray(): void {
        for (const account of this.newAccounts) this.accounts.unshift(account);
        this.newAccounts = [];

        this.errorService.clearErrorOnPage();
    }

    onQuery(searchTxt: string): void {
        if (!searchTxt) {
            this.isQuerying = false;
            this.errorService.handle404(this.accounts);
            return;
        }

        this.filteredAccounts = this.accounts.filter(it => it.email.slice(0, searchTxt.length).toLowerCase() === searchTxt.toLowerCase());
        this.errorService.handle404(this.filteredAccounts);
        this.isQuerying = true;
    }

    onAccountDelete(_id: string): void {
        const confirmation = confirm(`Are you sure you want to delete this account ?`);
        if (!confirmation) return;

        this.adminService.deleteAccount(_id)
            .subscribe(_ => this.removeAccount(_id), ({ status }: HttpErrorResponse) => {
                if (status === 404) this.removeAccount(_id);
            });
    }

    private removeAccount(_id: string): void {
        const indexToRemove = this.accounts.findIndex(e => e._id === _id);
        if (indexToRemove > -1) this.accounts.splice(indexToRemove, 1);

        this.errorService.handle404(this.accounts);
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }
}
