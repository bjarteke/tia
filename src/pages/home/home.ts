import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';
import { JsonProvider } from '../../providers/json/json';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turf from 'turf';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


//testing -->
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';


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


  //Testing intervalCountering box
  public seconds : number = 28500;


  //Variables used for retrieving data from JSON file
  public plan:Array<any>=[];
  public test : any;
  public keys;

  //Defining the default value of segment
  public planner : string = "kommende";

  public checkInOutTimes : any[] = []; //The first value is always the initial checkInTime, and the last is the final checkOutTime.

  public intervalTimes;
  public intervalTimesMinutes;

  //Used to calculate the loadingBar.
  public checkInOutTimesMinutes : string[] = []; 
  public currentWidth : string = "0%";
  public totalWidthSoFar : number = 0;
  public initialCheckIn : boolean = false;
  public latePercentage;

  public finishedBreak : boolean = false;
  public lateCheckIn : boolean = false;

  //Variables meant to be changed by the admin user
  private numberOfHoursRegardedAsNew = 72; //For how many hours are records marked as "new" 
  //private linkToArbeidsplan = 'https://api.myjson.com/bins/bfc1i'; 
  //private linkToArbeidsplan = '../www/assets/data/arbeidsplan.json';
  private linkToArbeidsplan = '../assets/data/arbeidsplan.json';

  private earlyCheckInHours = 2; //How many hour before scheduled start up are employees allowed to check in?

  //CONSTRCUCTOR
  constructor(public navCtrl: NavController, public locationTracker: LocationTracker, public http: HttpClient, private cdRef:ChangeDetectorRef) {
    this.http.get(this.linkToArbeidsplan).subscribe(data => {
    this.plan.push(data);
    this.test = this.plan[0];
    this.keys = Object.keys(this.plan[0]); 
          });
  }
 
  start() {
    this.locationTracker.startTracking();      //Start tracking location
    Observable.interval(2000).subscribe(
      ref => this.continueslyChecked());
  }

  continueslyChecked() {
    var currentDate = new Date();
    var startDate = new Date(this.test["ID1"]["Start"]);

    //Updating the loadingBar
    if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == false) {
      this.lateCheckIn = true;
      this.updateLoadingBarLate();
    }
    else if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == true){
      this.updateLoadingBar();
    }
    else {

    }

    this.checkIfBreak(this.test["ID1"]["Starttid"], this.test["ID1"]["Sluttid"]);

  }

  

  //Changing the text of the "Stemple inn/ut" box, and changing the color of the pin.
  checkInOut() {

    //Updating the LoadingBar
    if(this.lateCheckIn == true && this.checkInOutTimesMinutes.length == 0){
      this.checkInOutTimesMinutes.push(this.currentWidth);
      this.latePercentage = this.currentWidth;
      this.currentWidth="0%";
    }

    this.initialCheckIn = true;    //set that we have done an initial CheckIn
    this.checkInOutTimes.push(new Date());   //register the checkInTime

    if (this.checkInOutTimes.length > 1 && parseFloat(this.currentWidth.slice(0,-1)) + this.totalWidthSoFar < 100){
      this.createPercentForLoadingBar();
      this.currentWidth = "0%"; //Making sure that the new loadingBar starts at 0%
      this.totalWidthSoFar += parseFloat(this.checkInOutTimesMinutes[this.checkInOutTimesMinutes.length -1].slice(0,-1));
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
    for (var x = 0; x < this.checkInOutTimes.length -1 ; x++ ) {
      this.intervalTimes.push(this.calculateTimePeriod(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
      this.intervalTimesMinutes.push(this.calculateTimePeriodMinutes(this.checkInOutTimes[x],this.checkInOutTimes[x+1]));
    }
  }

 



  //LOADING BAR
  updateLoadingBar() {
    if(this.lateCheckIn == true && this.checkInOutTimesMinutes.length == 0) {
      this.checkInOutTimesMinutes.push(this.currentWidth);
    }
    var currentDate = new Date();
    var width = 100*(Math.abs((+currentDate - +this.checkInOutTimes[this.checkInOutTimes.length-1])/1000)/this.seconds);
    if (width < 100) {
      this.currentWidth = Math.min(100 - this.totalWidthSoFar, width)  +"%";
    }
  }

  updateLoadingBarLate() {
    var currentDate = new Date();
    var startDate = new Date(this.test["ID1"]["Start"]);
    var width = 100*(Math.abs((+currentDate - +startDate)/1000)/this.seconds);
    if (width < 100) {
      this.currentWidth = Math.min(100 - this.totalWidthSoFar, width)  +"%";
      
      this.checkedIn = true;
    }
    else {
      this.currentWidth = "100%";
    }
  }

  createPercentForLoadingBar() {
    this.checkInOutTimesMinutes = [];
    var startIndex = 0;

    if(this.lateCheckIn){
      this.checkInOutTimesMinutes.push(this.latePercentage);
    }

    for (var x = 0; x < this.checkInOutTimes.length -1 ; x++ ) {
      this.checkInOutTimesMinutes.push(100*(Math.abs((this.checkInOutTimes[x+1] - this.checkInOutTimes[x])/1000)/this.seconds) +"%");
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

    // Used to determing whether a rec is makered with a ribbon
  checkIfNew(addedDate : any) {
    var addedDating : Date;
    addedDating = new Date(addedDate);
    var today : Date;
    today = new Date();    
    if ((today.getTime() - addedDating.getTime())/(3600*1000) > this.numberOfHoursRegardedAsNew){
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


  

}

