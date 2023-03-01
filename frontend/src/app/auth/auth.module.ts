import { AuthComponent } from './auth.component';
import { ChangePassordComponent } from './change-password/change-password.component';
import { RequestPasswordResetComponent } from './request-pass-reset-email/request-pass-reset-email.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { NgModule } from '@angular/core';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
    declarations: [
        LoginSignupComponent,
        RequestPasswordResetComponent,
        ChangePassordComponent,
        AuthComponent,
        VerifyEmailComponent
    ],
    imports: [
        AuthRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class AuthModule { }
