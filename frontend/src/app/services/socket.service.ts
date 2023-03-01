import { environment } from './../../environments/environment';
import { AuthService } from './auth.service';
import { Injectable, OnInit } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnInit {

    private _connection: SocketIOClient.Socket;

    get connection(): SocketIOClient.Socket { return this._connection; }

    constructor(private authService: AuthService) {
        this._connection = io.connect(environment.wsUrl, { query: { token: this.authService.token }});
    }

    ngOnInit() {
    }

}
