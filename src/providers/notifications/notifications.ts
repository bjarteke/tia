import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController, Platform } from 'ionic-angular';
import { FirebaseServiceProvider } from '../firebase-service/firebase-service';
import { timestamp } from 'rxjs-compat/operator/timestamp';

/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationsProvider {

  constructor(public http: HttpClient, private localNotifications: LocalNotifications, private plt: Platform, public alertCtrl: AlertController, public fsp: FirebaseServiceProvider) {
    /*this.plt.ready().then((rdy) => {
      this.localNotifications.on('click').subscribe(notification => {
        let json = JSON.parse(notification.data);
        console.log(json)

        let alert = this.alertCtrl.create({
          title: notification.title,
          subTitle: json.mydata
        });
        console.log(alert);


      });
    });*/
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

  sendArrivalNotification() {
    this.localNotifications.schedule({
      title: "Velkommen på jobb!",
      text: "Du stemples inn om 10 minutter. Ha en fin dag!"
    });
  }

  scheduleLunchNotification(){
    var now = new Date();
    var lunsj = new Date(this.fsp.planNext[0]['Lunsj']);
    var tidTilLunsj = lunsj.getTime() - now.getTime();
    console.log('skriver masse');
    console.log(now);
    console.log(lunsj);
    console.log(lunsj.getTime());
    console.log(tidTilLunsj);
    if(tidTilLunsj > 0){
      console.log('kom seg hit!')
      setTimeout(this.sendLunchNotification, tidTilLunsj);
    }
  }

  sendLunchNotification() {
    console.log('Skal sende lunsjnotifikasjon nå');
    this.localNotifications.schedule({
      title: "Tid for lunsj!",
      text: "Nyt pausen, det fortjener du!"
    });
  }

  sendLeavingNotification() {
    console.log('skal si fra at du drar')
    this.localNotifications.schedule({
      title: "Drar du?",
      text: "Arbeidsdagen din ser ikke ut til å være helt over enda, sjekk appen."
    });
  }

}
