import { ValidationErrors, ValidatorFn, AbstractControl, FormGroup } from '@angular/forms';

export class SharedValidator {

    static required({ value }: AbstractControl): ValidationErrors | null {
        return value && (value.trim().length >= 1) ? null : { required: true };
    }

    static regex(regex: RegExp, error = 'Invalid value'): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            return value && regex.test(value.trim()) ? null : { regex: error };
        };
    }

    static minLength(requiredLength: number): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            return value && value.trim().length >= requiredLength ? null : { minLength: { requiredLength, currentLength: value.length } };
        };
    }


    static fileSize(maximumSizeInKb: number, errorMsg = `file is too large`): ValidatorFn {
        return ({ value }: AbstractControl): ValidationErrors | null => {
            if (!value) { return null; }
            const fileSize = (value as File).size / 1000; // in kilo bytes
            return fileSize <= maximumSizeInKb ? null : { fileSize: errorMsg };
        };
    }

    static equalControlsValue(controlOneName: string, controlTwoName: string, errorMsg?: string): ValidatorFn {
        return (form: FormGroup): { [key: string]: any } => {

            const controlOne = form.get(controlOneName);
            const controlTwo = form.get(controlTwoName);

            const isMatch = controlTwo.value === controlOne.value;

            if ((!isMatch) && controlOne.valid && controlTwo.valid) {
                controlTwo.setErrors({ notEqual: errorMsg || `Values Not match` });
            }

            return null;
        };
    }

    static isInt({ value }: AbstractControl): ValidationErrors | null {
        return value && value % 1 === 0 ? null : { intError: `Number must be an integer` };
    }
}
