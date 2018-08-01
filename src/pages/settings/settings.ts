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
  public address;
  public number;
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
    console.log("IONCHANGE");
    this.fsp.earlyCheckInMinutes = this.earlyCheckIn;
    this.fsp.autoCheckIn = this.automaticCheckIn;
    this.fsp.timeFromArrivalToCheckIn = this.timeFromArrivalToCheckIn;
    this.fsp.number = this.number;
    this.fsp.address = this.address;
    this.getPolygon();
    this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.address, this.number);
}

  getPolygon() {
    var url = "https://nominatim.openstreetmap.org/search.php?q="
    
    for (var x = 0; x<this.address.split(" ").length; x++) {
      url = url + this.address.split(" ")[x] + "+";
    }
    url = url + this.number + "&polygon_geojson=1&viewbox=&format=json";

    console.log("getPolygon");
    console.log(url);
    this.http.get(url).subscribe(data => {
      this.setPolygon(data)
          });
  }

  setPolygon(data){
    console.log(data);
    var polygon = [];
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][3]);
    polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][2]);
    polygon.push(data[0]["boundingbox"][1],data[0]["boundingbox"][3]);
    polygon.push(data[0]["boundingbox"][0],data[0]["boundingbox"][2]);
    this.fsp.polygon = polygon;
  }

}
