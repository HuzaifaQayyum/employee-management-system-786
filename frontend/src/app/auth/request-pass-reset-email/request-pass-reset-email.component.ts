import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SharedValidator } from '../../shared.validator';

@Component({
    templateUrl: './request-pass-reset-email.component.html',
    styleUrls: ['../shared-css/form.css']
})
export class RequestPasswordResetComponent {
    resetForm: FormGroup;
    serverMsg?: string;
    isServerError: boolean;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.resetForm = new FormGroup({
            email: new FormControl('', [SharedValidator.required, SharedValidator.regex(/.@gmail\.com$/, 'Invalid gmail account.')])
        });
    }

    get email() { return this.resetForm.get('email'); }

    onResetRequest() {
        if (this.resetForm.invalid) { return console.log(`Invalid form...`); }

        this.authService.requestResetPasswordEmail(this.resetForm.value)
            .subscribe(({ msg }) => this.serverMsg = msg, ({error: { errorMsg }}) => {
                this.serverMsg = errorMsg;
                this.isServerError = true;
            });

        this.resetForm.reset({ email: '' });
    }
}
