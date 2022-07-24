import { UrlTree, Router, CanLoad, Route, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanLoad, CanActivateChild {

    constructor(private userService: UserService, private router: Router) { }

    canActivateChild(): boolean | UrlTree  {
        return this.userService.user.admin ? true : this.router.createUrlTree(['']);
    }

    canLoad(route: Route): boolean {
        return this.userService.user.admin;
    }
}
