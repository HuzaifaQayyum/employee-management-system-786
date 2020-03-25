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

    constructor(private adminService: AdminService, private errorService: ErrorService, private socketService: SocketService) { }

    ngOnInit(): void { 
        this.adminService.fetchAccounts()
            .subscribe(accounts => { 
                this.isLoading = false;
                this.errorService.handle404(accounts);

                this.accounts = accounts;
            });

        const subsciption = this.errorService.onPageErrorAlert.subscribe(({ isServerError, msg }) => { 
            this.isServerError = isServerError;
            this.serverMsg = msg;

            if (this.isLoading) this.isLoading = false;
        });

        this.subscriptions.push(subsciption);

        // Realtime support
        this.socketService.connection.on('delete-account', this.onDeleteAccountEvent.bind(this));
        this.socketService.connection.on('new-account', this.onNewAccountEvent.bind(this));
    }

    private onDeleteAccountEvent(account: Account): void { 
        const deletedAccount = this.accounts.find(e => e._id === account._id) || this.newAccounts.find(e => e._id === account._id);
        if (deletedAccount) deletedAccount.deleted = true;
    }


    private onNewAccountEvent(account: Account): void { 
        this.newAccounts.push(account);
    }

    updateAccountsArray(): void { 
        for (const account of this.newAccounts) this.accounts.unshift(account);
        this.newAccounts = [];

        this.errorService.clearErrorOnPage();
    }

    onQuery(searchTxt: string): void { 

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
