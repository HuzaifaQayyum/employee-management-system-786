import { AuthService } from './../services/auth.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router, CanLoad, CanActivateChild } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad, CanActivateChild {

    constructor(private authService: AuthService, private router: Router) { }
    canActivateChild(): boolean | UrlTree {
        if (!this.authService.authenticated) { return true; }
        return this.router.createUrlTree(['']);
    }

    canLoad(): boolean {
        if (!this.authService.authenticated) { return true; }
        this.router.navigate(['']);
        return false;
    }

    canActivate(): boolean | UrlTree {
        if (!this.authService.authenticated) { return true; }
        return this.router.createUrlTree(['']);
    }
}
