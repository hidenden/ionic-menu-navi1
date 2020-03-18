import { Injectable } from '@angular/core';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  deviceToken: string;
  registrationType: string;
  badge: number = 0;
  pushObject: PushObject;

  constructor(
    private push: Push,
  ) { }

  initialize() {
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
      console.log('message -> ' + data.message);
      // if user using app and push notification comes
      this.refreshBadge();

      if (data.additionalData.foreground) {
        this.foregroundAction(data);
      } else if (data.additionalData.coldstart) {
        this.coldstartAction(data);
      } else {
        this.frombackgroundAction(data);
      }
    });

    this.pushObject.on('error').subscribe(error => {
      this.errorAction(error);
    });
  }

  private foregroundAction(data: any): void {
    console.log('Received in foreground');
  }

  private coldstartAction(data: any): void {
    console.log('Push notification clicked');
    this.pushNavigation();
    // console.log('ADD NAVIGATION HERE');
  }

  private frombackgroundAction(data: any): void {
    console.log('App returned from background');
  }

  private errorAction(error: any) : void {
    console.error('Error with Push plugin' + error);
  }

  private pushNavigation(): void {
    console.log('Navigate to folder/Index');
    /* 
    this.ngZone.run(() => {
      this.router.navigate(['folder', 'Inbox']);
    });
    */
   this.setBadge(0);
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

}
