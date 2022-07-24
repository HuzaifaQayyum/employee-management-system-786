import { SocketService } from '../../../services/socket.service';
import { ErrorService } from '../../../services/Error.service';
import { MainService } from '../../../services/main.service';
import { AdminService } from '../../../services/admin.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Supervisor } from '../../../models/Supervisor.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-supervisors-managment',
  templateUrl: './supervisors-managment.component.html',
  styleUrls: ['./supervisors-managment.component.css']
})
export class SupervisorsManagmentComponent implements OnInit, OnDestroy {
  isLoading = true;
  supervisors: Supervisor[] = [];
  filteredSupervisors: Supervisor[] = [];
  isSearching: boolean;
  serverError?: boolean;
  serverMsg?: string;
  private subscriptions: Subscription[] = [];
  newSupervisors: Supervisor[] = [];
  totalNoOfPages: number;
  currentPageNo = 1;
  isLoadingMoreDocuments: boolean;

  constructor(private adminService: AdminService, private mainService: MainService, private socketService: SocketService, private errorService: ErrorService) { }

  ngOnInit(): void {
    this.adminService.fetchSupervisors()
      .subscribe(supervisors => {
        this.isLoading = false;
        this.errorService.handle404(supervisors);

        this.supervisors = supervisors;
      }, this.errorService.handleHttpError.bind(this.errorService));

    this.adminService.fetchTotalPagesOfSupervisors()
      .subscribe(({ pages }) => this.totalNoOfPages = pages);


    // Subscribing to Error Event
    const subscription = this.errorService.onPageErrorAlert.subscribe(error => {
      if (this.isLoading) this.isLoading = false;

      this.serverError = error.isServerError;
      this.serverMsg = error.msg;
    });
    this.subscriptions.push(subscription);

    // Realtime
    this.socketService.connection.on('new-supervisor', this.onNewSupervisorEvent.bind(this));
    this.socketService.connection.on('delete-supervisor', this.onDeleteSupervisorEvent.bind(this));
    this.socketService.connection.on('update-supervisor', this.onUpdateSupervisorEvent.bind(this));
  }

  private onNewSupervisorEvent(supervisor: Supervisor): void {
    this.newSupervisors.push(supervisor);
  }

  private onDeleteSupervisorEvent(supervisor: Supervisor): void {
    const deletedSupervisor = this.supervisors.find(e => e._id === supervisor._id) || this.newSupervisors.find(e => e._id === supervisor._id);
    if (deletedSupervisor) deletedSupervisor.deleted = true;
  }

  private onUpdateSupervisorEvent(supervisor: Supervisor): void {
    const updatedSupervisorIndex = this.supervisors.findIndex(e => e._id === supervisor._id);
    if (updatedSupervisorIndex > -1) {
      this.supervisors[updatedSupervisorIndex] = { ...supervisor, updated: true };
      return;
    }

    const indexInUpdatedSupervisors = this.newSupervisors.findIndex(e => e._id === supervisor._id);
    if (updatedSupervisorIndex > -1) this.newSupervisors[indexInUpdatedSupervisors] = { ...supervisor, updated: true };
  }

  loadMoreSupervisors(): void { 
    this.isLoadingMoreDocuments = true;

    this.adminService.fetchSupervisors(this.currentPageNo)
      .subscribe(supervisors => { 
        this.supervisors.push(...supervisors);
        this.currentPageNo++;
        this.isLoadingMoreDocuments = false;
      })
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) { subscription.unsubscribe(); }
  }

  trackByFn(index: number, item: Supervisor) {
    return index;
  }

  onQuery(searchTxt: string): void {
    if (!searchTxt) {
      this.isSearching = false;
      this.errorService.handle404(this.supervisors);
      return;
    }

    this.filteredSupervisors = this.supervisors.filter(it => it.name.slice(0, searchTxt.length).toLowerCase() === searchTxt.toLowerCase());
    this.errorService.handle404(this.filteredSupervisors);
    this.isSearching = true;
  }

  updateSupervisorsArray(): void {
    for (const supervisor of this.newSupervisors) { this.supervisors.unshift(supervisor); }
    this.newSupervisors = [];

    this.errorService.clearErrorOnPage();
  }

  onSupervisorDelete(_id: string): void {
    const confirmed = confirm(`Are you sure you want to delete this supervisor ?`);
    if (!confirmed) { return; }

    this.adminService.deleteSupervisor(_id)
      .subscribe(_ => this.removeSupervisor(_id),
        ({ status }: HttpErrorResponse) => {
          if (status === 404) this.removeSupervisor(_id);
        });
  }

  private removeSupervisor(_id: string): void {
    const indexToRemove = this.supervisors.findIndex(e => e._id === _id);
    this.supervisors.splice(indexToRemove, 1);

    this.errorService.handle404(this.supervisors);
  }

}
