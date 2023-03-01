import { Component } from '@angular/core';

@Component({
    template: `
        <div class="wrapper">
            <header>
                <h3 routerLink="/auth">Authentication Zone</h3>
            </header>
            <div class="route-wrapper">
                <router-outlet></router-outlet>
            </div>
        </div>
    `,
    styles: [`
        .wrapper {
            background-image: url('../../../assets/images/bg2.jpg');
            height: 100vh;
            top: 0;
            left: 0;
        }

        header {
            background: #223;
            color: #fff;
            padding: 0 10px;
            cursor: pointer;
            height: 8vh;
            line-height: 8vh;
        }

        .route-wrapper { 
        }
    `]
})
export class AuthComponent { }
