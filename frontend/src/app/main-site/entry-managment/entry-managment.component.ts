import { SocketService } from './../../services/socket.service';
import { ErrorService } from './../../services/Error.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './../../services/notification.service';
import { Entry } from './../../models/Entry.model';
import { MainService } from './../../services/main.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './entry-managment.component.html',
    styleUrls: ['./entry-managment.component.css']
})
export class EntryManagmentComponent implements OnInit, OnDestroy {
    isLoading = true;
    entries: Entry[] = [];
    serverError?: boolean;
    serverMsg?: string;
    private subscriptions: Subscription[] = [];
    newEntries: Entry[] = [];
    totalNoOfPages: number;
    currentPageNo = 1;
    isLoadingMoreDocuments: boolean;

    constructor(private mainService: MainService, private notificationService: NotificationService, private errorService: ErrorService, private socketService: SocketService) { }

    ngOnInit(): void {
        this.mainService.fetchEntries()
            .subscribe(entries => {
                this.isLoading = false;
                this.errorService.handle404(entries);

                this.entries = entries;
            }, this.errorService.handleHttpError.bind(this.errorService));


        this.mainService.fetchTotalPagesOfEntries()
            .subscribe(({ pages }) => this.totalNoOfPages = pages);

        // Error handling
        const subscrption1 = this.errorService.onPageErrorAlert.subscribe(({ isServerError, msg }) => {
            if (this.isLoading) { this.isLoading = false; }

            this.serverError = isServerError;
            this.serverMsg = msg;
        });

        this.subscriptions.push(subscrption1);

        // Realtime updates
        this.socketService.connection.on('new-entry', this.onNewEntryEvent.bind(this));
        this.socketService.connection.on('delete-entry', this.onDeleteEntryEvent.bind(this));
        this.socketService.connection.on('update-entry', this.onUpdateEntryEvent.bind(this));
    }

    private onNewEntryEvent(entry: Entry): void {
        this.newEntries.push(entry);
    }

    private onDeleteEntryEvent(entry: Entry): void {
        const deletedEntry = this.entries.find(e => e._id === entry._id) || this.newEntries.find(e => e._id === entry._id);
        if (deletedEntry) deletedEntry.deleted = true;
    }

    private onUpdateEntryEvent(entry: Entry): void {
        const updatedEntryIndex = this.entries.findIndex(e => e._id === entry._id);
        if (updatedEntryIndex > -1) {
            this.entries[updatedEntryIndex] = { ...entry, updated: true };
            return;
        }

        const updatedEntryIndexInNewEntries = this.newEntries.findIndex(e => e._id === entry._id);
        if (updatedEntryIndexInNewEntries > -1) this.entries[updatedEntryIndexInNewEntries] = { ...entry, updated: true };
    }

    loadMoreEntries(): void {
        this.isLoadingMoreDocuments = true;
        this.mainService.fetchEntries(this.currentPageNo)
            .subscribe(entries => {
                this.entries.push(...entries);
                this.currentPageNo++;
                this.isLoadingMoreDocuments = false;
            });
    }

    updateEntriesArray(): void {
        for (const entry of this.newEntries) { this.entries.unshift(entry); }
        this.newEntries = [];

        this.errorService.clearErrorOnPage();
    }

    onDeleteEntry(_id: string): void {
        const confirmed = confirm(`Are you sure you want to delete this supervisor ?`);
        if (!confirmed) { return; }

        this.mainService.deleteEntry(_id)
            .subscribe(_ => {
                this.removeEntry(_id);
                this.notificationService.add(`Entry deleted successfully.`);
            }, ({ status }: HttpErrorResponse): void => {
                if (status === 404) {
                    this.removeEntry(_id);
                }
            });
    }

    private removeEntry(_id: string): void {
        const indexToRemove = this.entries.findIndex(e => e._id === _id);
        this.entries.splice(indexToRemove, 1);

        this.errorService.handle404(this.entries);
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) { subscription.unsubscribe(); }
    }
}
