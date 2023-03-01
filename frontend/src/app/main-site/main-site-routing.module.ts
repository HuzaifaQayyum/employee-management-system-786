import { AdminGuard } from './../guards/admin.guard';
import { EntryManagmentComponent } from './entry-managment/entry-managment.component';
import { MainGuard } from './../guards/main.guard';
import { DownloadReportComponent } from './download-report/download-report.component';
import { MainSiteComponent } from './main-site.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddUpdateEntryComponent } from './entry-managment/add-update-entry/add-update-entry.component';

const routes: Routes = [
    { path: '', canActivate: [MainGuard], canActivateChild: [MainGuard], component: MainSiteComponent, children: [
        { path: 'entry-managment/add', component: AddUpdateEntryComponent },
        { path: 'entry-managment/update', component: AddUpdateEntryComponent },
        { path: 'entry-managment', component: EntryManagmentComponent },
        { path: 'download-report', component: DownloadReportComponent },
        { path: 'admin', canLoad: [AdminGuard], loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
        { path: '**', redirectTo: '/entry-managment' }
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainSiteRoutingModule { }
