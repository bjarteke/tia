import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';
import { JsonProvider } from '../../providers/json/json';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turf from 'turf';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  public checkInOutTimes : any[] = []; //The first value is always the initial checkInTime, and the last is the final checkOutTime.
  public checkInOutTimesMinutes : string[] = []; //Used to calculate the loadingBar.


  public checkedIn : boolean = true;
  public withinRange : boolean = false;

  //Variables used to change the text and color of the "stemple inn"-button.
  public stempleButton : string = "Stemple inn";
  public checkInOutVar : string = "checkInOut";

  public sluttid;


  //Testing intervalCountering box
  public seconds : number = 100;


  //Variables used for retrieving data from JSON file
  public plan:Array<any>=[];
  public test : any;
  public keys;

  public planner : string = "kommende";



  //Variables meant to be changed by the admin user
  private numberOfHoursRegardedAsNew = 72;
  private linkToArbeidsplan = 'https://api.myjson.com/bins/bfc1i'; 
  //private linkToArbeidsplan = '../assets/data/arbeidsplan.json';

  //CONSTRCUCTOR
  constructor(public navCtrl: NavController, public locationTracker: LocationTracker, public http: HttpClient) {
    this.checkInOutTimesMinutes.push("0%"); //To make sure that the loadingBar has an initial length of 0% 
    this.http.get(this.linkToArbeidsplan).subscribe(data => {
    this.plan.push(data);
    this.test = this.plan[0];
    this.keys = Object.keys(this.plan[0]); 

          });
  }
 
  start(){
    this.locationTracker.startTracking();    
  }

// START: READING JSON
  checkIfNew(addedDate : any) {
    var addedDating : Date;
    addedDating = new Date(addedDate);
    var today : Date;
    today = new Date();

    console.log((today.getTime() - addedDating.getTime())/(3600*1000));
    
    if ((today.getTime() - addedDating.getTime())/(3600*1000) > this.numberOfHoursRegardedAsNew){
      return false;
    }
    return true;
  }

// END: READING JSON

//Changing the text of the "Stemple inn/ut" box, and changing the color of the pin.
  checkInOut() {
    this.checkInOutTimes.push(new Date());
    if (this.checkInOutTimes.length > 1){
      this.calculateLengthOfAllIntervals();
    }
    if (this.stempleButton == "Stemple inn"){
      this.stempleButton = "Stemple ut";
      this.checkInOutVar = "checkInOut2";
      this.checkedIn = false;
    }
    else{
      this.stempleButton = "Stemple inn";
      this.checkInOutVar = "checkInOut";
      this.checkedIn = true;
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

  calculateTimePeriodMinutes(time1 : any, time2 : any) {
    if (this.checkInOutTimes.length > 1) {
      var m = Math.abs((new Date (time2).getMinutes()-new Date (time1).getMinutes()));
      var h = Math.abs((new Date (time2).getHours()-new Date (time1).getHours()));

      var outM = h*60*60 + m*60;

      return outM;
    }
  }

  calculateLengthOfAllIntervals(){
    var intervalList : any[] = []
    var intervalListMinutes : number[] = []

    this.checkInOutTimesMinutes = [];
    for (var x = 0; x < this.checkInOutTimes.length -1 ; x++ ) {
      intervalList.push(this.calculateTimePeriod(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
      intervalListMinutes.push(this.calculateTimePeriodMinutes(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
      this.checkInOutTimesMinutes.push(100*(Math.abs((this.checkInOutTimes[x+1] - this.checkInOutTimes[x])/1000)/this.seconds) +"%");

    }
  }

  fromTimestampToTextIdagImorgen(dato : any, timestamp : any) {
    var today = new Date(); 
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if(new Date(timestamp).setHours(0,0,0,0) == today.setHours(0,0,0,0)){
      return "I dag";
    }
    else if (new Date(timestamp).setHours(0,0,0,0) == tomorrow.setHours(0,0,0,0)){
     return "I morgen";
    }
    else {
      return dato;
    }
  }

}

