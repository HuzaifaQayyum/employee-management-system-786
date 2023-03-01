import { NotificationService } from './../../services/notification.service';
import { Component, OnInit } from '@angular/core';
import { Notification } from '../../models/Notification';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.notificationAlert.subscribe(notification => {
      this.notifications.unshift(notification);
      setTimeout(_ => this.notifications.pop(), 2000);
    });
  }

  closeNotification(_id: number): void {
    const index = this.notifications.findIndex(e => e._id = _id);
    this.notifications.splice(index, 1);
  }

}
