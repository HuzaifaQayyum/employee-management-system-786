import { EntryNonPopulated } from '../../../models/Entry-nonPopulated.model';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { SharedValidator } from '../../../shared.validator';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Supervisor } from '../../../models/Supervisor.model';
import { MainService } from '../../../services/main.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
    templateUrl: './add-update-entry.component.html',
    styleUrls: ['./add-update-entry.component.css']
})
export class AddUpdateEntryComponent implements OnInit {
    isLoading = true;
    supervisors: Supervisor[];
    entryForm: FormGroup;
    formSubmitted = false;
    isAdmin: boolean;
    serverMsg?: string;

    entryData: EntryNonPopulated;
    isUpdating: boolean;


    get date(): AbstractControl { return this.entryForm.get('date'); }
    get noOfHrs(): AbstractControl { return this.entryForm.get('noOfHrs'); }
    get from(): AbstractControl { return this.entryForm.get('from'); }
    get to(): AbstractControl { return this.entryForm.get('to'); }

    constructor(private mainService: MainService, 
                private userService: UserService,
                private notificationService: NotificationService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.isAdmin = this.userService.user.admin;

        this.mainService.fetchSupervisors().subscribe(supervisors => {
            this.supervisors = supervisors;
            this.initForm();

            this.isUpdating = this.route.snapshot.queryParamMap.get('updating') === 'true';
            if (this.isUpdating) {
                this.entryData = {
                    _id: this.route.snapshot.queryParamMap.get('_id'),
                    from: this.route.snapshot.queryParamMap.get('from'),
                    to: this.route.snapshot.queryParamMap.get('to'),
                    noOfHrs: parseInt(this.route.snapshot.queryParamMap.get('noOfHrs')),
                    date: this.formatDate(this.route.snapshot.queryParamMap.get('date'))
                };

                this.setEntryFormDefaults();
            }

            this.isLoading = false;
        });
    }

    setEntryFormDefaults(): void {
        this.entryForm.patchValue({
            from: this.entryData.from,
            to: this.entryData.to,
            noOfHrs: this.entryData.noOfHrs,
            date: this.entryData.date
        });
        this.entryForm.updateValueAndValidity();
    }

    private formatDate(_date: string): string {
        const date = new Date(_date);
        return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    }

    initForm(): void {
        this.entryForm = new FormGroup({
            date: new FormControl('2002-02-12', Validators.required),
            noOfHrs: new FormControl(1, [Validators.required, Validators.min(1), SharedValidator.isInt]),
            from: new FormControl(this.supervisors[0]?._id, Validators.required),
            to: new FormControl(this.supervisors[1]?._id, Validators.required)
        });
    }

    onFromChange(event: Event): void {
        const selectedValue = (event.target as HTMLSelectElement).value;

        if (selectedValue === this.to.value) {
            const selectedFromIndex = this.supervisors.findIndex(e => e._id === selectedValue);
            const indexToToggle = (selectedFromIndex + 1) > (this.supervisors.length - 1) ? 0 : selectedFromIndex + 1;
            this.entryForm.patchValue({ to: this.supervisors[indexToToggle]._id });
            this.entryForm.updateValueAndValidity();
        }
    }

    private isNewDocument({ controls }: FormGroup, data: any): boolean {
        for (const key in data) {
            if (controls[key] && controls[key].value !== data[key]) { return true; }
        }

        return false;
    }

    onFormSubmit(): void {
        this.formSubmitted = true;
        if (this.entryForm.invalid) { return; }

        if (this.isUpdating) {
            if (!this.isNewDocument(this.entryForm, this.entryData)) {
                return (this.serverMsg = 'Please make some changes to update document.') && null;
            }
            else if (this.serverMsg) { this.serverMsg = null; }

            this.mainService.updateEntry(this.entryData._id, this.entryForm.value)
                    .subscribe(_ => this.onSuccessfullCreateUpdate(`Entry updated sucessfully`), this.onFailCreateUpdate);
        } else {
            this.mainService.uploadEntry(this.entryForm.value)
                .subscribe(_ => this.onSuccessfullCreateUpdate(`Entry added successfully.`), this.onFailCreateUpdate);
        }
    }

    private onSuccessfullCreateUpdate(msg: string): void {
        this.notificationService.add(msg);
        this.router.navigate(['/entry-managment']);
    }

    private onFailCreateUpdate({ error: { to, from, noOfHrs, date, errorMsg } }): void {
        this.serverMsg = to || from || noOfHrs || date || errorMsg;
    }
}
