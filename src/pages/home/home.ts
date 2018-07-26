import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turf from 'turf';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';


//testing -->
import { ContactPage } from '../contact/contact';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { getLocaleTimeFormat } from '@angular/common';

import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  public checkedIn : boolean = true;
  public withinRange : boolean = false;

  //Variables used to change the text and color of the "stemple inn"-button.
  public stempleButton : string = "Stemple inn";
  public checkInOutVar : string = "checkInOut";

  public sluttid;

  //Defining the default value of segment
  public planner : string = "kommende";

  //The first value is always the initial checkInTime, and the last is the final checkOutTime.
  public checkInOutTimes : any[] = []; 

  public intervalTimes;
  public intervalTimesMinutes;

  //Used to calculate the loadingBar.
  public segmentWidth : string[] = []; //Width of all segments, except the last
  private currentWidth : string = "0%"; //Width of the last segment
  private totalWidthSoFar : number = 0; //The sum of all entries in the segmentWidth array
  private initialCheckIn : boolean = false; //Indicate whether the employee has made an initial check in
  public latePercentage : string ="0%"; //How many percent of the total work day was the employee late. 
  private lateCheckIn : boolean = false; //Whether or not the employee checked in late
  private seconds; //How many seconds the work day lasts. 
  private stop : boolean = false; //Indicates whether the loading bar is running.

  public finishedBreak : boolean = false;

  //Variables meant to be changed by the admin user
  private numberOfHoursRegardedAsNew = 72; //For how many hours are records marked as "new"? 
  private earlyCheckInHours = 2; //How many hour before scheduled start up are employees allowed to check in?
  private numberOfSecondsFromOnLocationToCheckIn = 10;
  private activateAutomaticCheckInOut = true;

  //CONSTRUCTOR
  constructor(public navCtrl: NavController, public locationTracker: LocationTracker, public http: HttpClient, public firebaseService : FirebaseServiceProvider) {
    console.log("ER I KONSTRUKTØR FØR TRACKER");
    console.log("ER I KONSTRUKTØR FØR START");
    this.start();
}
 
  start() {
          //Start tracking location
    Observable.interval(1000).subscribe(
      ref => this.continueslyChecked());
      console.log("Start");

 }

  continueslyChecked() {
      this.locationTracker.startTracking();
    if (this.firebaseService.planNext[0] != undefined && this.locationTracker.onLocationTime != undefined ){
        this.seconds = ((new Date (this.firebaseService.planNext[0]["Slutt"])).getTime()/1000 - (new Date (this.firebaseService.planNext[0]["Start"])).getTime()/1000) //Number of seconds
      

      var currentDate = new Date();
      var startDate = new Date(this.firebaseService.planNext[0]["Start"]);

      console.log("SJEKKHER");
      console.log(currentDate.getTime());
      console.log(this.locationTracker.onLocationTime.getTime());
      console.log(currentDate.getTime() - this.locationTracker.onLocationTime.getTime());

      //Automatic check in
      if (currentDate.getTime() - this.locationTracker.onLocationTime.getTime() > this.numberOfSecondsFromOnLocationToCheckIn*1000 && !this.initialCheckIn && this.activateAutomaticCheckInOut) {
        this.checkInOut();
      }

      //Updating the loadingBar
      if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == false) {
        //If too late, and not checked in.
        this.lateCheckIn = true;
        this.updateLoadingBarLate();
      }
      else if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == true && this.stop == false){
        //If already checked in.
        this.updateLoadingBar();
      }
      else {
        //If not not too late, and not checked in
      }


      this.checkIfBreak(this.firebaseService.planNext[0]["Starttid"], this.firebaseService.planNext[0]["Sluttid"]);
    }

  }

  checkInOut() {
    //Updating the LoadingBar with a red color corresponding to late check in time.

    if(this.lateCheckIn == true && this.segmentWidth.length == 0 && this.stop == false){
      this.segmentWidth.push(this.currentWidth);
      this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0,-1));
      this.latePercentage = this.currentWidth;
      this.currentWidth="0%";
    }

    this.initialCheckIn = true;    //set that we have done an initial CheckIn
    this.checkInOutTimes.push(new Date());   //register the checkInTime
    this.firebaseService.addCheckInOutTime(this.checkInOutTimes);
    if (this.checkInOutTimes.length > 1 && parseFloat(this.currentWidth.slice(0,-1)) + this.totalWidthSoFar < 100 && this.stop == false){
        this.segmentWidth.push(this.currentWidth);
        this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0,-1));
        this.currentWidth = "0%"; //Making sure that the new loadingBar starts at 0%
    }

    //Changing the text of the "Stemple inn/ut" box, changing the color of the pin.
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
    for (var x = 0; x < this.checkInOutTimes.length -1 ; x++ ) {
      this.intervalTimes.push(this.calculateTimePeriod(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
      this.intervalTimesMinutes.push(this.calculateTimePeriodMinutes(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
    }
  }

  //LOADING BAR
  updateLoadingBar() {
    //Adding the first segment if employee has checked in late

    if(this.lateCheckIn == true && this.segmentWidth.length == 0) {
      this.segmentWidth.push(this.currentWidth);
    }
    var currentDate = new Date();
    var startDate = new Date(this.firebaseService.planNext[0]["Start"]);

    //Setting the width of the current segment
    this.currentWidth = Math.min(100-this.totalWidthSoFar,100*(Math.abs((+currentDate - +this.checkInOutTimes[this.checkInOutTimes.length-1])/1000)/this.seconds)) + "%";
    
    //Stopping loading bar when it has been filled.
    if (this.currentWidth == 100-this.totalWidthSoFar + "%" && this.stop == false){
      this.segmentWidth.push(this.currentWidth);
      this.stop = true; //Making sure that no additional segments are added to the loading bar.
      this.currentWidth = "0%";
    }

  }

  updateLoadingBarLate() {
    var currentDate = new Date();
    var startDate = new Date(this.firebaseService.planNext[0]["Start"]);
    var width = 100*(Math.abs((+currentDate - +startDate)/1000)/this.seconds);
    if (width < 100) {
      this.currentWidth = Math.min(100 - this.totalWidthSoFar, width)  +"%";
      
      this.checkedIn = true;
    }
    else {
      this.currentWidth = "100%";
    }
  }

  checkIfBreak(startTime : any, endTime : any) {
    var currentTime = new Date();
    var lengthOfDayInMinutes = this.calculateTimePeriodMinutes(endTime, startTime);
    var minutesSinceStart = this.calculateTimePeriodMinutes(currentTime,endTime);

    if (minutesSinceStart/lengthOfDayInMinutes > 0.4 && !this.finishedBreak) {
      //Method for sending notification.
    }
    else {
    }


  }

    // Used to determine whether a rec is markered with a ribbon
  checkIfNew(addedDate : any) {
    var addedDating = new Date(addedDate).getTime();
    var today = new Date().getTime();

    if ((today - addedDating)/(3600*1000) > this.numberOfHoursRegardedAsNew){
      return false;
    }
    return true;
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

  correctTime(timeStamp : any) {
    var workDate = new Date(timeStamp);
    var currentDate = new Date();
    if (workDate.getMonth() == currentDate.getMonth() && workDate.getDate() == currentDate.getDate() && workDate.getHours() - currentDate.getHours() < this.earlyCheckInHours || currentDate.getDate() - workDate.getDate() > 0 ){
      return true;
    }
    return false;
  }

  getWeekdayName(timestamp) {
    var d = new Date(timestamp);
    var weekday = new Array(7);
    weekday[0] = "Søndag";
    weekday[1] = "Mandag";
    weekday[2] = "Tirsdag";
    weekday[3] = "Onsdag";
    weekday[4] = "Torsdag";
    weekday[5] = "Fredag";
    weekday[6] = "Lørdag";

    return weekday[d.getDay()];
  }


  itemSelected(item,segmentWidth) {
     this.navCtrl.push(ContactPage, {
       item: item,
       segmentwidth : segmentWidth
     });
  }

  

  

}

