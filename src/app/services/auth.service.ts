import { UserService } from './user.service';
import { User } from '../models/User.model';
import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface AuthFormData {
    email: string;
    password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private url = `${environment.serverUrl}/auth`;
    serverMsg = new Subject<string>();
    isServerError = new Subject<boolean>();
    private _authenticated = false;

    get token(): string { return localStorage.getItem('token') || sessionStorage.getItem('token') || null; }
    get authenticated(): boolean { return this._authenticated; }
    set authenticated(authenticated: boolean) { this._authenticated = authenticated; }

    constructor(private userService: UserService, private http: HttpClient, private router: Router) { }

    private changeServerMsg(msg: string, isError: boolean = false) {
        this.isServerError.next(isError); // must be on top
        this.serverMsg.next(msg);
    }

    login(formData: AuthFormData, remember: boolean): void {
        this.http.post<{ token: string }>(this.url + '/login', formData)
            .subscribe(
                ({ token }) => {
                    if (remember) this.saveTokenAndRedirect(token);
                    else this.saveTokenTemporaryAndRedirect(token);
                },
                ({ error: { errorMsg } }) => this.changeServerMsg(errorMsg, true)
            );
    }

    signup(formData: AuthFormData): void {
        this.http.post<{ msg: string }>(this.url + '/signup', formData)
            .subscribe(
                ({ msg }) => this.changeServerMsg(msg),
                ({ error: { errorMsg } }) => this.changeServerMsg(errorMsg, true)
            );
    }

    requestResetPasswordEmail(formData: { email: string }): Observable<{ msg: string }> {
        return this.http.post<{ msg: string }>(this.url + '/request-password-reset', formData);
    }

    changePassword(formData: { token: string, newPassword: string, confirmNewPassword: string }): Observable<{ token: string }> {
        return this.http.put<{ token: string }>(this.url + '/reset-password', formData);
    }

    verifyEmail(token: string): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(this.url + '/verify-email', { token });
    }

    authenticateUser(_token?: string): void {
        const token = _token || this.token;
        if (token) {
            const { validTill, verified } = jwt_decode(token) as User;
            const timeLeft = validTill - new Date().getTime();
            if (verified && timeLeft > 0) {
                this.authenticated = true;

                this.userService.setUser(token);

                setTimeout(_ => this.logoutUser, timeLeft);
                this.router.navigate(['/home']);
                return;
            }
        }
        localStorage.removeItem('token');
        this.authenticated = false;
    }

    saveTokenAndRedirect(token: string): void {
        localStorage.setItem('token', token);
        this.authenticateUser(token);
    }
    
    saveTokenTemporaryAndRedirect(token: string): void {
        sessionStorage.setItem('token', token);
        this.authenticateUser(token);
    }

    logoutUser() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        this.authenticated = false;
        this.router.navigate(['/auth']);
    }
}
