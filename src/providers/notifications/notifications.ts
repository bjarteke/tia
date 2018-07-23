import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController, Platform } from 'ionic-angular';

/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationsProvider {

  constructor(public http: HttpClient, private localNotifications: LocalNotifications, private plt: Platform, public alertCtrl: AlertController) {
    this.plt.ready().then((rdy) => {
      this.localNotifications.on('click').subscribe(notification => {
        let json = JSON.parse(notification.data);
        console.log(json)

        let alert = this.alertCtrl.create({
          title: notification.title,
          subTitle: json.mydata
        });
        console.log(alert);


      });
    });
  }


  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: "Velkommen på jobb!",
      text: "Vil du sjekke inn?",
      trigger: {at: new Date(new Date().getTime() + 5 * 1000)}

    });
  }

}
