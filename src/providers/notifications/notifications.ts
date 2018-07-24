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
    this.localNotifications.addActions('yes-no', [
      { id: 'yes', title: 'Yes', needsAuth: false },
      { id: 'no',  title: 'No', needsAuth: false }
    ]);
    console.log('Her kommer svaret:     ');
    console.log(this.localNotifications.getIds());
    console.log(this.localNotifications.hasActions('yes'));
    this.localNotifications.schedule({
      id: 1,
      title: "Velkommen på jobb kjære deg!",
      text: "Vil du sjekke inn?",
      trigger: {at: new Date(new Date().getTime() + 1000)},
      actions: 'yes-no'
    });
    this.localNotifications.on('yes').subscribe(notification => {
      console.log('DET FUNKA!!!');
    });
    this.localNotifications.on('no').subscribe(notification => {
      console.log('DET FUNKA HER OG!!!');
    });
  }

}
