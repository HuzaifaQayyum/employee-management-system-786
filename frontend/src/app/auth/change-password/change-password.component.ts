import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SharedValidator } from '../../shared.validator';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as jwt_decode from 'jwt-decode';

@Component({
    templateUrl: './change-password.component.html',
    styleUrls: ['../shared-css/form.css', './change-password.component.css']
})
export class ChangePassordComponent implements OnInit {
    changePasswordForm: FormGroup;
    isFormSubmitted = false;
    serverMsg?: string;
    isServerError?: boolean;
    private token: string;
    isSettingPassword: string;

    get newPassword(): AbstractControl { return this.changePasswordForm.get('newPassword'); }
    get confirmNewPassword(): AbstractControl { return this.changePasswordForm.get('confirmNewPassword'); }

    constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.paramMap.get('token');

        const { isSettingPassword } = jwt_decode(this.token);
        this.isSettingPassword = isSettingPassword;
        
        this.changePasswordForm = new FormGroup({
            newPassword: new FormControl('', [SharedValidator.required, SharedValidator.minLength(5)]),
            confirmNewPassword: new FormControl('', [SharedValidator.required, SharedValidator.minLength(5)]),
            token: new FormControl(this.token)
        }, { validators: SharedValidator.equalControlsValue('newPassword', 'confirmNewPassword', `Passwords Don't match`), updateOn: 'change' });
    }

    onChangePassword(): void {
        this.isFormSubmitted = true;
        if (this.changePasswordForm.invalid) { return; }

        this.authService.changePassword(this.changePasswordForm.value)
            .subscribe(({ token }) => this.authService.saveTokenAndRedirect(token), ({ error: { errorMsg }, status }) => {
                this.serverMsg = errorMsg;
                this.isServerError = true;
                if (status === 404) {
                    alert(`Invalid token or token already used. Redirect?`);
                    this.router.navigate(['/auth']);
                 }
            });
    }
}
