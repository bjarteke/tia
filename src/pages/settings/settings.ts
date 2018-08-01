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
  public timeFromArrivalToCheckIn;
  public address = "";
  public number = "";
  public polygon;

  constructor(public navCtrl: NavController, public http: HttpClient, public navParams: NavParams,public fsp : FirebaseServiceProvider, public toastCtrl: ToastController) {
    this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
    this.automaticCheckIn = this.fsp.autoCheckIn;
    this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
    this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
    this.automaticCheckIn = this.fsp.autoCheckIn;
    this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
  }

  ionChanges(){
    this.fsp.earlyCheckInMinutes = this.earlyCheckIn;
    this.fsp.autoCheckIn = this.automaticCheckIn;
    this.fsp.timeFromArrivalToCheckIn = this.timeFromArrivalToCheckIn;
    if(this.number != "" && this.address !=""){
      this.fsp.number = this.number;
      this.fsp.address = this.address;
      this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.address, this.number);
      this.getPolygon(this.address,this.number);
    }
    else if (this.address != "" && this.number == ""){
      this.fsp.address = this.address;
      this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.address, this.fsp.number);
      this.getPolygon(this.address,this.fsp.number);
    }
    else if (this.address == "" && this.number != ""){
      this.fsp.number = this.number;
      this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.fsp.address, this.number);
      this.getPolygon(this.fsp.address, this.number);
    }
    else {
      this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.fsp.address, this.fsp.number);
    }
    const toast = this.toastCtrl.create({
        message: 'Innstillinger lagret',
        duration: 3000,
        position: 'top',
        cssClass: 'toast-success'
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
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][3]);
    polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][2]);
    polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][3]);
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
    this.fsp.polygon = polygon;
  }

}
