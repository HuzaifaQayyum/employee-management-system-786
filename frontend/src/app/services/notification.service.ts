import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Notification } from '../models/Notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    notificationAlert = new Subject<Notification>();
    private currentId = 1;

    constructor(private http: HttpClient) { }

    add(msg: string, title?: string): void {
        this.notificationAlert.next({ _id: this.currentId++, title, msg });
    }
}
