import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { HttpClient } from '@angular/common/http';

import { ToastController } from 'ionic-angular';


/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public earlyCheckIn;
  public automaticCheckIn;
  public enableNotifications;
  public timeFromArrivalToCheckIn;
  public address = "";
  public number = "";
  public polygon;
  public addressDataFromAPI;

  constructor(public navCtrl: NavController, public http: HttpClient, public navParams: NavParams,public fsp : FirebaseServiceProvider, public toastCtrl: ToastController) {
    this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
    this.automaticCheckIn = this.fsp.autoCheckIn;
    this.enableNotifications = this.fsp.enableNotifications;
    this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
    this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
    this.automaticCheckIn = this.fsp.autoCheckIn;
    this.enableNotifications = this.fsp.enableNotifications;
    this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
  }

  ionChanges(){
    this.fsp.earlyCheckInMinutes = this.earlyCheckIn;
    this.fsp.autoCheckIn = this.automaticCheckIn;
    this.fsp.enableNotifications = this.enableNotifications;
    this.fsp.timeFromArrivalToCheckIn = this.timeFromArrivalToCheckIn;
    if(this.number != "" && this.address !=""){
      this.getPolygon(this.address,this.number);
    }
    else if (this.address != "" && this.number == ""){
      this.getPolygon(this.address,this.fsp.number);
    }
    else if (this.address == "" && this.number != ""){
      this.getPolygon(this.fsp.address, this.number);
    }
    else {
      this.getPolygon(this.fsp.address, this.fsp.number);
    }
    
}

toast(message,cssClass){
  const toast = this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: 'top',
        cssClass: cssClass
      });
    toast.present();
}

  getPolygon(adr,num) {
    var url = "https://nominatim.openstreetmap.org/search.php?q="
    
    for (var x = 0; x<adr.split(" ").length; x++) {
      url = url + adr.split(" ")[x] + "+";
    }
    url = url + num + "&polygon_geojson=1&viewbox=&format=json";

    console.log("getPolygon");
    console.log(url);
    this.http.get(url).subscribe(data => {
      this.setPolygon(data)
          });
  }

  setPolygon(data){
    var polygon = [];
    console.log("BOUND");
    this.addressDataFromAPI = data;
    if(data.length == 0) {
      this.toast('Fant ikke adresse','toast-failed');
    }
    else {
      polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
      polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][3]);
      polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][2]);
      polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][3]);
      polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
      this.fsp.polygon = polygon;
      if(this.number != "" && this.address !=""){
        this.fsp.number = this.number;
        this.fsp.address = this.address;
      }
      else if (this.address != "" && this.number == ""){
        this.fsp.address = this.address;
      }
      else if (this.address == "" && this.number != ""){
        this.fsp.number = this.number;
      }
      else {
      }
      this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.fsp.address, this.fsp.number, this.fsp.enableNotifications);
      this.toast('Innstillinger endret','toast-success');
    }
  }

}
