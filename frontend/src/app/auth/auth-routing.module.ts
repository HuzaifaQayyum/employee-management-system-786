import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AuthGuard } from './../guards/auth.guard';
import { AuthComponent } from './auth.component';
import { ChangePassordComponent } from './change-password/change-password.component';
import { RequestPasswordResetComponent } from './request-pass-reset-email/request-pass-reset-email.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '', canActivate: [AuthGuard], canActivateChild: [AuthGuard], component: AuthComponent, children: [
            { path: '', component: LoginSignupComponent, pathMatch: 'full' },
            { path: 'request-password-reset', component: RequestPasswordResetComponent },
            { path: 'reset-password/:token', component: ChangePassordComponent },
            { path: 'verify-email/:token', component: VerifyEmailComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
