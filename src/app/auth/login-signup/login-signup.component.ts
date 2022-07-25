import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SharedValidator } from '../../shared.validator';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  templateUrl: './login-signup.component.html',
  styleUrls: ['../shared-css/form.css', './login-signup.component.css']
})
export class LoginSignupComponent implements OnInit, OnDestroy {
  authForm: FormGroup;
  isServerError: boolean;
  serverMsg: string;
  loginMode = true;
  isFormSubmitted = false;
  private subscriptions: Subscription[] = [];
  rememberMe: FormControl;

  get email(): AbstractControl { return this.authForm.get('email'); }
  get password(): AbstractControl { return this.authForm.get('password'); }

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit(): void {
    // Temporary
    if (!this.userService.user)
      alert(`LOGIN Credentials\n\nFor Admin\n\temail: admin@gmail.com\n\tpassword: 12345\nFor Supervisor\n\temail: user@gmail.com\n\tpassword: 12345`)
    // 

    this.authForm = new FormGroup({
      email: new FormControl('', [SharedValidator.required, SharedValidator.regex(/.@gmail\.com$/, 'Invalid gmail account.')]),
      password: new FormControl('', [Validators.minLength(5), Validators.required])
    });

    this.rememberMe = new FormControl(true);
    
    this.subscriptions.push(this.authService.serverMsg.subscribe(msg => {
      this.serverMsg = msg;
      if (!this.isServerError) { this.authForm.reset(); this.isFormSubmitted = false; }
    }));
    this.subscriptions.push(this.authService.isServerError.subscribe(isError => this.isServerError = isError));
  }

  ngOnDestroy(): void {
    for (const subs of this.subscriptions) { subs.unsubscribe(); }
  }

  onLoginSignup(): void {
    this.isFormSubmitted = true;
    if (this.authForm.invalid) { return console.log(`Invalid form`); }

    if (this.loginMode) { 
      this.authService.login(this.authForm.value, this.rememberMe.value);
    } else { 
      this.authService.signup(this.authForm.value);
    }
  }

}
