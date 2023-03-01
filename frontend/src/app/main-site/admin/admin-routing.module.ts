import { AccountsManagementComponent } from './account-management/account-management.component';
import { AdminGuard } from './../../guards/admin.guard';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from "@angular/core";

import { SupervisorsManagmentComponent } from './supervisors-managment/supervisors-managment.component';
import { AddUpdateSupervisor } from './supervisors-managment/add-update-supervisor/add-update-supervisor.component';
import { AddUpdateAccountComponent } from './account-management/add-update-account/add-update-account.component';

const routes: Routes = [
    {
        path: '', canActivateChild: [AdminGuard], children: [
            { path: 'supervisors-managment', component: SupervisorsManagmentComponent },
            { path: 'supervisors-managment/add', component: AddUpdateSupervisor },
            { path: 'supervisors-managment/update', component: AddUpdateSupervisor },
            { path: 'accounts-management', component: AccountsManagementComponent },
            { path: 'accounts-management/add', component: AddUpdateAccountComponent },
            { path: 'accounts-management/update', component: AddUpdateAccountComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
