import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from './../../../../services/admin.service';
import { SharedValidator } from './../../../../shared.validator';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    templateUrl: './add-update-account.component.html',
    styleUrls: ['./add-update-account.component.css']
})
export class AddUpdateAccountComponent implements OnInit {
    accountForm: FormGroup;
    isFormSubmitted = false;
    serverMsg?: string;
    isUpdating = false;
    backupAccountData?: { email: string; _id: string; isAdmin: boolean };

    get email(): AbstractControl { return this.accountForm.get('email'); }

    constructor(private adminService: AdminService, private route: ActivatedRoute, private notificationService: NotificationService, private router: Router) { }

    ngOnInit(): void {
        this.accountForm = new FormGroup({
            email: new FormControl('', [SharedValidator.required, SharedValidator.regex(/.@gmail\.com$/, 'Only valid gmail account is allowed')]),
            isAdmin: new FormControl(false)
        });

        this.isUpdating = this.route.snapshot.queryParamMap.get('isUpdating') === 'true';
        if (this.isUpdating) {
            this.backupAccountData = {
                _id: this.route.snapshot.queryParamMap.get('_id'),
                isAdmin: this.route.snapshot.queryParamMap.get('isAdmin') === 'true',
                email: this.route.snapshot.queryParamMap.get('email')
            }

            this.setFormDefault();
        }
    }

    setFormDefault(): void {
        this.accountForm.patchValue({
            email: this.backupAccountData.email,
            isAdmin: this.backupAccountData.isAdmin
        });
    }

    private isNewDocument({ controls }: FormGroup, data: any): boolean {
        for (const key in data) {
            if (controls[key] && controls[key].value !== data[key]) { return true; }
        }

        return false;
    }

    private onAccountFormSubmittedSuccessfull(msg: string): void { 
        if (this.serverMsg) { this.serverMsg = ''; }

        this.notificationService.add(msg);
    
        this.isFormSubmitted = false;
        this.accountForm.reset();
    }

    private onAccountFormSubmittedError({ error: { errorMsg } }: HttpErrorResponse): void { 
        this.serverMsg = errorMsg;
    }

    onCreateUpdateAccount(): void {
        this.isFormSubmitted = true;
        if (this.accountForm.invalid) return console.log(`Invalid form`);

        if (this.isUpdating) {
            const isNew = this.isNewDocument(this.accountForm, this.backupAccountData);
            if (!isNew) {
                this.serverMsg = `Please modify data to upate account.`;
                return;
            };

            this.adminService.updateAccount(this.backupAccountData._id, this.accountForm.value)
                .subscribe(_ => { 
                    this.onAccountFormSubmittedSuccessfull(`Account updated Successfully.`);
                    this.router.navigate(['/admin/accounts-management']);
                }, this.onAccountFormSubmittedError.bind(this));
        }
        else
            this.adminService.createAccount(this.accountForm.value)
                .subscribe(_ => this.onAccountFormSubmittedSuccessfull(`Account added sucessfully.`), this.onAccountFormSubmittedError.bind(this));
    }
}
