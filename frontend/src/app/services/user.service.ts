import { Injectable } from '@angular/core';
import { User } from '../models/User.model';
import * as jwt_decode from 'jwt-decode';


@Injectable({ providedIn: 'root' })
export class UserService {

    private _user: User;

    get user(): User { return this._user; }

    constructor() { }

    setUser(token: string) { 
        this._user = jwt_decode(token);
    }
}