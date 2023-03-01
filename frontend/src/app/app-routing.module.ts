import { MainGuard } from './guards/main.guard';
import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'auth', canLoad: [AuthGuard], loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '', canLoad: [MainGuard], loadChildren: () => import('./main-site/main-site.module').then(m => m.MainSiteModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
