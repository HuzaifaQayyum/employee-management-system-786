import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivateChild, CanActivate, CanLoad, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MainGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(private authService: AuthService, private router: Router) { }

    canLoad(): boolean {
        if (this.authService.authenticated) { return true; }
        this.router.navigate(['/auth']);
        return false;
    }

    canActivate(): boolean | UrlTree {
        if (this.authService.authenticated) { return true; }
        return this.router.createUrlTree(['/auth']);
    }

    canActivateChild(): boolean | UrlTree {
        if (this.authService.authenticated) { return true; }
        return this.router.createUrlTree(['/auth']);
    }
}
