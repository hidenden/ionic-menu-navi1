import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Inbox',
      url: '/folder/Inbox',
      icon: 'mail'
    },
    {
      title: 'Outbox',
      url: '/folder/Outbox',
      icon: 'paper-plane'
    },
    {
      title: 'Favorites',
      url: '/folder/Favorites',
      icon: 'heart'
    },
    {
      title: 'Archived',
      url: '/folder/Archived',
      icon: 'archive'
    },
    {
      title: 'Trash',
      url: '/folder/Trash',
      icon: 'trash'
    },
    {
      title: 'Spam',
      url: '/folder/Spam',
      icon: 'warning'
    }
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private push: Push,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initPushNotification();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  initPushNotification() {
    if (!this.platform.is('ios')) {
      console.warn('Push notifications not initialized.  Run in physical device');
      return;
    }
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
    const pushObject: PushObject = this.push.init(options);
    this.preparePushNotification(pushObject);
    this.push.hasPermission().then( perm => {
      console.log(`PushNotification permission: ${perm.isEnabled}`);
      if (perm.isEnabled) {
        console.log('Have Push permission');
      } else {
        console.log('Not have Push permission');
      }
    });
  }

  pushNavigation() {
    console.log('Navigate to folder/Index');
    this.ngZone.run(() => {
      this.router.navigate(['folder', 'Inbox']);
    });
  }

  preparePushNotification(pushObject: PushObject) {
    pushObject.on('registration').subscribe((data: any) => {
      console.log('device token -> ' + data.registrationId);
      console.log('registratio type -> ' + data.registrationType);
      // TODO - send device token to server
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('message -> ' + data.message);
      // if user using app and push notification comes
      if (data.additionalData.foreground) {
        console.log('Received in foreground');
      } else if (data.additionalData.coldstart) {
        console.log('Push notification clicked');
        this.pushNavigation();
        // console.log('ADD NAVIGATION HERE');
      } else {
        console.log('App returned from background');
      }
    });

    pushObject.on('error').subscribe(error => console.error('Error with Push plugin' + error));
  }

}
