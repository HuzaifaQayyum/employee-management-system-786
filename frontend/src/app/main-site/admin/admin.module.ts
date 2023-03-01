import { AccountsManagementComponent } from './account-management/account-management.component';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../../shared-components/shared.module';
import { NgModule } from "@angular/core";

import { SupervisorsManagmentComponent } from './supervisors-managment/supervisors-managment.component';
import { AddUpdateSupervisor } from './supervisors-managment/add-update-supervisor/add-update-supervisor.component';
import { AddUpdateAccountComponent } from './account-management/add-update-account/add-update-account.component';

@NgModule({ 
    declarations: [
        SupervisorsManagmentComponent,
        AddUpdateSupervisor,
        AccountsManagementComponent,
        AddUpdateAccountComponent
    ],
    imports: [
        AdminRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ]
})
export class AdminModule { }
