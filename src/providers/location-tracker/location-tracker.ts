import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turf from 'turf'; 
import { NotificationsProvider } from '../notifications/notifications';
import { Observable } from 'rxjs';


@Injectable()
export class LocationTracker {
 
  public watch: any;   
  public lat: number = 0;
  public lng: number = 0;
  public paJobb : boolean = false;
  public changed: boolean = false; 
  public sentNotification: boolean = false;
  public lastTimestamp : any;
  public onLocationTime;
  public forlotTid = null; 
  public initialRun = false;
 
  constructor(public zone: NgZone, public backgroundGeolocation: BackgroundGeolocation, private geolocation : Geolocation, public notifications: NotificationsProvider) {
 
  }
 
  startTracking() {
  this.initialRun = true;
    // Background Tracking
  let config = {
    desiredAccuracy: 0,
    stationaryRadius: 20,
    distanceFilter: 10,
    debug: false,
    interval: 2000
  };
 
  this.backgroundGeolocation.configure(config).subscribe((location) => {
 
    console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
 
    // Run update inside of Angular's zone
    this.zone.run(() => {
      this.lat = location.latitude;
      this.lng = location.longitude;
      this.lastTimestamp = location.time;
      this.insidePolygonCheck(this.lat, this.lng);
    });
 
  }, (err) => {
 
    console.log(err);
 
  });
 
  // Turn ON the background-geolocation system.
  this.backgroundGeolocation.start();
  
  // Foreground Tracking
let options = {
  frequency: 3000,
  enableHighAccuracy: true
};
 
this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
 
  console.log(position);
 
  // Run update inside of Angular's zone
  this.zone.run(() => {
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    this.insidePolygonCheck(this.lat, this.lng);
    this.lastTimestamp = position.timestamp;
  });
 
});
  }
 
  stopTracking() {
    console.log('stopTracking');
 
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
 
  }
  
  insidePolygonCheck(lat : number, lng : number) {
    var pt = turf.point([lat, lng]);
    var poly = turf.polygon([[
       [59.92129099886785,10.676581263542177],
       [59.921715793124974,10.678812861442568],
        [59.920544214017035,10.678955353796484],
        [59.92064638252022,10.67635897547007],
      [59.92129099886785,10.676581263542177]
      ]]);
      console.log("ER VI PÅ JOBB?????")
      console.log(booleanPointInPolygon(pt,poly));
      this.paJobb = booleanPointInPolygon(pt,poly);
      this.evaluateSendNotification()
      if(this.paJobb == false){
        this.sentNotification == false;
      }
  }

  evaluateSendNotification(){
    console.log('Her kommer logg! \n');
    console.log(this.paJobb)
    console.log(this.sentNotification)
    if(this.paJobb && this.sentNotification == false){
      this.notifications.sendArrivalNotification();
      this.sentNotification = true;

      /* Knows that you have arrived at work, so will also schedule notification for lunch */
      this.notifications.scheduleLunchNotification();
      this.onLocationTime = new Date();
    }

  }


}