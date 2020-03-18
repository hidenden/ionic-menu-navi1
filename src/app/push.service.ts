import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  deviceToken: string;
  registrationType: string;
  badge: number = 0;
  pushObject: PushObject;
  notificationData: any|null = null;
  isAutoClearBadge = false;
  urlProvider : (data:any) => string[] | null = null;
  
  constructor(
    private push: Push,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  activate() {
    const options: PushOptions = {
      android: {
        senderID: 'SomeSenderID',
        forceShow: 'true'
      },
      ios: {
        alert: 'true',
        badge: 'true',
        sound: 'true',
      },
      windows: {}
    }
    this.pushObject = this.push.init(options);

    this.preparePushNotification();

    this.push.hasPermission().then( perm => {
      console.log(`PushNotification permission: ${perm.isEnabled}`);
      if (perm.isEnabled) {
        console.log('Have Push permission');
      } else {
        console.log('Not have Push permission');
      }
    });    
  }

  private preparePushNotification() : void {

    this.pushObject.on('registration').subscribe((data: any) => {
      this.updateToken(data.registrationId, data.registrationType);
    });

    this.pushObject.on('notification').subscribe((data: any) => {
      this.notificationData = data;
      this.refreshBadge();

      if (this.notificationData.additionalData.foreground) {
        this.foregroundAction();
      } else if (this.notificationData.additionalData.coldstart) {
        this.coldstartAction();
      } else {
        this.frombackgroundAction();
      }
    });

    this.pushObject.on('error').subscribe(error => {
      this.errorAction(error);
    });
  }

  private foregroundAction(): void {
    console.log('Received in foreground');
    console.log('message -> ' + this.notificationData.message);
  }

  private coldstartAction(): void {
    console.log('Push notification clicked');
    console.log('message -> ' + this.notificationData.message);
    this.pushNavigation();
    // console.log('ADD NAVIGATION HERE');
  }

  private frombackgroundAction(): void {
    console.log('App returned from background');
    console.log('message -> ' + this.notificationData.message);
  }

  private errorAction(error: any) : void {
    console.error('Error with Push plugin' + error);
  }

  private pushNavigation(): void {
    if (this.urlProvider) {
      console.log('Navigate by Push Notification');
      this.ngZone.run(() => {
        this.router.navigate(this.urlProvider(this.notificationData));
      });
    }
    if (this.isAutoClearBadge) {
      this.clearBadge();
    }
  }

  getToken(): string{
    return this.deviceToken;
  }

  private updateToken(token: string, registType: string) : void {
    this.deviceToken = token;
    this.registrationType = registType;

    console.log('device token -> ' + this.deviceToken);
    console.log('registratio type -> ' + this.registrationType);

    console.log('--- Send a device token to the server at here ---');
  }

  getBadge(): number {
    return this.badge;
  }

  private refreshBadge() : void {
    this.pushObject.getApplicationIconBadgeNumber().then((num) => {
      this.badge = num;
      console.log('Badge number refresh:' + this.badge);
    });
  }

  setBadge(num: number) {
    this.pushObject.setApplicationIconBadgeNumber(num).then(() => {
      this.badge = num;
      console.log('Badge number is set:' + this.badge);
    });
  }

  clearBadge(): void {
    this.setBadge(0);
  }

  getNotificationData(): any|null {
    return this.notificationData;
  }

  setUrlProvider(fn:(data:any) => string[] | null) {
    this.urlProvider = fn;
  }

  setAutoClearBadge(flag: boolean) {
    this.isAutoClearBadge = flag;
  }

}
