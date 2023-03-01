import { MainService } from './services/main.service';
import { Notification } from './models/Notification';
import { ErrorService } from './services/Error.service';
import { AuthService } from './services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  errors: Notification[] = [];

  constructor(private mainService: MainService, private authService: AuthService, private errorServie: ErrorService) { }

  ngOnInit() {
    this.authService.authenticateUser();
    this.errorServie.popupErrorAlert.subscribe(error => {
      if (this.errors.find(e => e.msg === error.msg)) return;
      
      this.errors.push(error);
    });

    // Request for notification permission
    // this.requestNotificationPermission();
  }

  private urlBase64ToUint8Array(base64String): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  

  private async requestNotificationPermission() { 
    if (window.Notification && navigator.serviceWorker && Notification.permission === 'default') {
      const permission = await window.Notification.requestPermission();

      if (permission === 'granted') { 
        // Register for web push notification
        const swReg = await navigator.serviceWorker.ready;
        let subscription = await swReg.pushManager.getSubscription();

        if (!subscription) { 
          // Registering new one
          const vapidKey = 'BLauPlTBpqrn5L-R40beLfccqSKrNgHJM9lZXg2s4N2rMEigTvsmpFNr8rPI6sVu3w4kHhyf_ySIPZ0zQKDMwHg';
          subscription = await swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: this.urlBase64ToUint8Array(vapidKey) });
        }

        // Save to backend
        this.mainService.registerPushNotification(subscription);
      }

    }
  }

  closeError(_id: number): void {
    this.errors.splice(this.errors.findIndex(e => e._id === _id), 1);
  }
}
