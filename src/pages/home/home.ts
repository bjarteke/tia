import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turf from 'turf';
 

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  public checkInOutTimes : any[] = []; //The first value is always the initial checkInTime, and the last is the final checkOutTime.

  public checkedIn : boolean = true;
  public withinRange : boolean = false;

  //Variables used to change the text and color of the "stemple inn"-button.
  public stempleButton : string = "Stemple inn";
  public checkInOutVar : string = "checkInOut";

  constructor(public navCtrl: NavController, public locationTracker: LocationTracker) {
 
  }
 
  start(){
    this.locationTracker.startTracking();
  }
 
  stop(){
    this.locationTracker.stopTracking();
  }

  checkInOut() {
    this.checkInOutTimes.push(new Date());
    if (this.checkInOutTimes.length > 5){
      this.calculateLengthOfAllIntervals();
    }
    if (this.stempleButton == "Stemple inn"){
      this.stempleButton = "Stemple ut";
      this.checkInOutVar = "checkInOut2";
    }
    else{
      this.stempleButton = "Stemple inn";
      this.checkInOutVar = "checkInOut";
    }
    
  }

  //Calculate how many hours and minutes between two timestamps.
  calculateTimePeriod(time1 : any, time2 : any) {
    if (this.checkInOutTimes.length > 1) {
      var m = Math.abs((new Date (time2).getMinutes()-new Date (time1).getMinutes()));
      var h = Math.abs((new Date (time2).getHours()-new Date (time1).getHours()));

      var outH = ""+h;
      var outM = ""+m;

      outH = (h<10) ? "0"+ h : outH;
      outM = (m<10) ? "0"+ m : outM;

      return (outH + ":" + outM);
    }
   
  }

  calculateLengthOfAllIntervals(){
    var intervalList : any[] = []
    console.log(this.checkInOutTimes);
    for (var x = 0; x < this.checkInOutTimes.length -1 ; x++ ) {
      intervalList.push(this.calculateTimePeriod(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
    }
    console.log(intervalList);
  }
 
}