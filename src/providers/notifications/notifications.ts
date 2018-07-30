import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController, Platform } from 'ionic-angular';
import { FirebaseServiceProvider } from '../firebase-service/firebase-service';
import { retry } from 'rxjs/operators';


/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationsProvider {

  public plan:Array<any>=[];
  public test = [];
  public keys = [];

  constructor(public http: HttpClient, private localNotifications: LocalNotifications, private plt: Platform, public alertCtrl: AlertController) {
  }

  sendNotification(type: string, timestamp: any){ 
    this.http.get('../www/assets/data/notifications.json').subscribe(data => {
      this.localNotifications.schedule({
        title: data[type]["title"],
        text: data[type]['text_pre'] + this.fromTimestampToHHMM(timestamp) + data[type]['text_post']
      });
    });
  }


  fromTimestampToHHMM(timestamp) {
    var date = new Date(timestamp);
    var m = Math.abs((new Date (date).getMinutes()));
    var h = Math.abs((new Date (date).getHours()));

    var outH = ""+h;
    var outM = ""+m;

    outH = (h<10) ? "0"+ h : outH;
    outM = (m<10) ? "0"+ m : outM;

    return (outH + ":" + outM);
  }

}
