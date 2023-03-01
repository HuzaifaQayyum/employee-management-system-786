import { User } from './../models/User.model';
import { AuthService } from './../services/auth.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';


@Component({
    templateUrl: './main-site.component.html',
    styleUrls: ['./main-site.component.css']
})
export class MainSiteComponent implements OnInit {
    user: User;
    toggleNavActive = false;
    showNavBar = window.innerWidth <= 1040;

    @HostListener('window:resize', ['$event']) private onWindowResize(event: Event): void { 
        this.showNavBar = (event.target as Window).innerWidth <= 1040;
    }

    constructor(private authService: AuthService, private userService: UserService) { }

    ngOnInit(): void {
        this.user = this.userService.user;
    }

    onLogout(): void { this.authService.logoutUser(); }
}
