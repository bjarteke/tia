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
import { SettingsPage } from '../settings/settings';

import { getLocaleTimeFormat } from '@angular/common';

import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { NotificationsProvider } from '../../providers/notifications/notifications';
import { NotExpr } from '../../../node_modules/@angular/compiler';




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 
  public checkedIn : boolean = false;
  public checkInTime = null;
  public waitingToCheckIn: boolean = false;
  public withinRange : boolean = false;

  //Variables used to change the text and color of the "stemple inn"-button.
  public stempleButton : string = "Stemple inn";
  public checkInOutVar : string = "checkInOut";

  public sluttid;

  public doneOnce: boolean = false;
  public paJobb: boolean = false;
  public forlotTid = null;

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

  public initialLocationSet : boolean = false;
  public initialFirebase : boolean = false;


  //Variables meant to be changed by the admin user
  private numberOfHoursRegardedAsNew = 72; //For how many hours are records marked as "new"? 
  private earlyCheckInHours = 0.25; //How many hour before scheduled start up are employees allowed to check in?
  private numberOfSecondsFromOnLocationToCheckIn = 10;
  private activateAutomaticCheckInOut = true;
  private enableNotifications = true;

  //CONSTRUCTOR
  constructor(public navCtrl: NavController, public locationTracker: LocationTracker, public http: HttpClient, public fsp : FirebaseServiceProvider, public notifications: NotificationsProvider) {
    this.start();
    //this.setInitialLoadingBar();
  }
 
  start() {
    Observable.interval(1000).subscribe(
      ref => this.continueslyChecked());
    }
    
  continueslyChecked() {
    console.log("LATECHECKIN2");
    console.log(this.lateCheckIn);
    if(!this.initialLocationSet){
      this.locationTracker.startTracking();      //Start tracking location
      this.initialLocationSet = true;
    }

    this.paJobb = this.locationTracker.paJobb;

    /* Starter på nytt om man ikke klarer å lese fra databasen*/
    if (this.fsp.upcoming[0] == undefined){
      return;
    }

    this.fsp.getCheckedIn();
    //console.log('status på checkedIn', this.checkedIn);
    this.checkedIn = this.fsp.checkedIn;
    //console.log('status på activateAutomaticCheckInOut', this.activateAutomaticCheckInOut);
    //console.log('status på autoCheckIn', this.fsp.autoCheckIn);


    if (this.checkedIn){
      this.stempleButton = 'Stemple ut';
      this.checkInOutVar = "checkInOut2";
    }
    else if(!this.checkedIn){
      this.stempleButton = 'Stemple inn';
      this.checkInOutVar = 'checkInOut';
    }

    //this.checkedIn = this.fsp.planNext[0]["checkedIn"];

    /* Set the duration of the work session in seconds */
    this.seconds = ((new Date (this.fsp.upcoming[0]["Slutt"])).getTime()/1000 - (new Date (this.fsp.upcoming[0]["Start"])).getTime()/1000) //Number of seconds

    if(!this.initialFirebase){
      console.log("SET INITIAL LOADING BAR");
      this.setInitialLoadingBar();
      this.initialFirebase = true;
    }

    

    var currentDate = new Date();
    var startDate = new Date(this.fsp.upcoming[0]["Start"]);
    var endDate = new Date(this.fsp.upcoming[0]['Slutt']);

    this.activateAutomaticCheckInOut = this.fsp.autoCheckIn;
    this.enableNotifications = this.fsp.enableNotifications;

    /* Automatic Check-in */
    var now = new Date();
    if (this.paJobb && this.fsp.isWorking(now) && !this.checkedIn && !this.waitingToCheckIn && this.activateAutomaticCheckInOut){
      
      this.fsp.writeArrivalTime(now);
      this.checkInTime = new Date(this.fsp.decideCheckInTime(now));
      console.log(this.checkInTime);

      this.waitingToCheckIn = true;
      console.log('time to check in');
    }

    else if(this.checkInTime != null && this.waitingToCheckIn && new Date().getTime() > this.checkInTime.getTime() && !this.checkedIn && this.activateAutomaticCheckInOut){
      this.checkInOut(this.checkInTime);
      this.waitingToCheckIn = false;
    }

    

    /* Updating the loadingBar */
    if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == false) {
      //If too late, and not checked in.
      if(this.currentWidth == "0%"){
        this.updateLoadingBarLate();
        this.lateCheckIn = true;
      }
      else{
        console.log("LATECHECKIN1");
        console.log(this.lateCheckIn);
      }
    }
    else if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == true && this.stop == false){
      //If already checked in.
      
      
      this.updateLoadingBar();
      
    }
    else {
      //If not not too late, and not checked in
    }

    

    //Logic for checking if you leave work 
    this.checkLeave(endDate);
  }

  manuallyCheckInOut(){
    this.activateAutomaticCheckInOut = false;
    this.fsp.updateAutomaticSetting(false);
    this.checkInOut(new Date());
  }

  checkInOut(checkInTime) {
    /* Updating the LoadingBar with a red color corresponding to late check in time. */
    if(this.lateCheckIn == true && this.segmentWidth.length == 0 && this.stop == false){
      this.segmentWidth.push(this.currentWidth);
      this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0,-1));
      this.latePercentage = this.currentWidth;
      this.currentWidth="0%";
    }

    this.initialCheckIn = true;    //set that we have done an initial CheckIn
    this.checkInOutTimes.push(new Date(checkInTime));   //register the checkInTime
    //this.fsp.addCheckInOutTime(new Date());
    if (this.checkInOutTimes.length > 1 && parseFloat(this.currentWidth.slice(0,-1)) + this.totalWidthSoFar < 100 && this.stop == false){
        this.segmentWidth.push(this.currentWidth);
        this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0,-1));
        this.currentWidth = "0%"; //Making sure that the new loadingBar starts at 0%
    }

    /* Changing the text of the "Stemple inn/ut" box, changing the color of the pin. */
    if (this.stempleButton == "Stemple inn"){
      this.stempleButton = "Stemple ut";
      this.checkInOutVar = "checkInOut2";
      this.checkedIn = true;
      this.fsp.writeCheckedIn(this.checkedIn);
    }
    else{
      this.stempleButton = "Stemple inn";
      this.checkInOutVar = "checkInOut";
      this.checkedIn = false;
      this.fsp.writeCheckedIn(this.checkedIn);
    }
    
  }

  //LOADING BAR
  updateLoadingBar() {
    //Adding the first segment if employee has checked in late
    if(this.lateCheckIn == true && this.segmentWidth.length == 0) {
      this.segmentWidth.push(this.currentWidth);
    }
    var currentDate = new Date();
    var startDate = new Date(this.fsp.upcoming[0]["Start"]);

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
    var startDate = new Date(this.fsp.upcoming[0]["Start"]);
    var width = 100*(Math.abs((+currentDate - +startDate)/1000)/this.seconds);
    if (width < 100) {
      this.currentWidth = Math.min(100 - this.totalWidthSoFar, width)  +"%";
      
    }
    else {
      this.currentWidth = "100%";
    }
  }

  /* Sets the segments of the initial loading bar based on check in/out times stored in Firebase*/
  setInitialLoadingBar(){
    var stempletider = this.fsp.upcoming[0]["Stempletider"];
    this.totalWidthSoFar = 0;
    var segmentWidth = [];
    for (var x = 1; x<stempletider.length; x++) {
      var date1 = new Date(stempletider[x]);
      var date0 = new Date(stempletider[x-1]);
      var temp = 100*(Math.abs((+date1 - +date0)/1000)/this.seconds);
      segmentWidth.push(Math.min(100-this.totalWidthSoFar,temp) + "%");
      this.totalWidthSoFar += parseFloat(segmentWidth[x-1].slice(0,-1));
    }
    this.segmentWidth = segmentWidth;
    var currentDate = new Date();
    var temp = 100*(Math.abs((+new Date(stempletider[stempletider.length - 1]) - +currentDate)/1000)/this.seconds);
    this.currentWidth = Math.min(100-this.totalWidthSoFar,temp) + "%";
    if(+new Date(stempletider[0]) - +new Date(this.fsp.upcoming[0]["Start"]) > 0){
      this.lateCheckIn = true;
    }
  }

  /* STYLING */

  // Used to determine whether a rec is markered with a ribbon
  checkIfNew(addedDate : any) {
    var addedDating = new Date(addedDate).getTime();
    var today = new Date().getTime();

    if ((today - addedDating)/(3600*1000) > this.numberOfHoursRegardedAsNew){
      return false;
    }
    return true;
  }

  // Write "i dag" or "i morgen" in the upper box if the next work session is today or tomorrow
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

  // Returning the name of the weekday from a timestamp
  getWeekdayName(timestamp) {
    var d = new Date(timestamp);
    var weekday = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    return weekday[d.getDay()];
  }

  // Called when the used click on one of the work sessions in order to open the detailed page
  itemSelected(item,segmentWidth) {
    console.log(item);
     this.navCtrl.push(ContactPage, {
       item: item,
       segmentwidth : segmentWidth
     });
  }

  checkLeave(endDate){
    if (this.locationTracker != undefined) {
      this.paJobb = this.locationTracker.paJobb;

    }

    //Må hente ut når man slutter for dagen og sjekke om man går for tidlig. Gir da en notifikasjon på når man slutter og at man kan melde sykdom i appen. 
    //Sjekker om man går fra jobb før man er ferdig
    var now = new Date();
    var bufferTime = now.getTime() + 600000

    if (bufferTime < endDate.getTime() && this.paJobb == false && this.forlotTid == null && this.checkedIn){
      this.forlotTid = now;
    }
    else if(this.forlotTid == null){
      return;
    }
    else if(now.getTime() - this.forlotTid.getTime() > 5000 && bufferTime < endDate.getTime() && this.paJobb == false && this.checkedIn && !this.doneOnce && this.enableNotifications){
      this.notifications.sendNotification('leftEarly', endDate);
      this.doneOnce = true;
    }
    //hvis man går inn i sonen igjen blir tiden man dro resatt
    else if (this.paJobb == true){
      this.doneOnce = false;
      this.forlotTid = null;
    }

    //Hvis man har vært utenfor området i mer enn 5 minutter blir man automatisk sjekket ut. 
    else if(now.getTime() - this.forlotTid.getTime() > 60000 && this.checkedIn && this.paJobb == false){
      this.checkInOut(this.forlotTid);
    }
    //Må også sende notification første gang man registrerer at man forlater jobb. 
    else if(now.getTime() >= endDate.getTime() && this.paJobb == false && this.checkedIn && this.forlotTid != null && this.enableNotifications){
      this.notifications.sendNotification('check_out', this.forlotTid);
    }
  }

   timestampToDate(timestamp){
    timestamp = new Date(timestamp);
    var months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august" , "september" , "oktober" , "november" , "desember" ]
    var d = timestamp.getDate();
    var outD = (d<10) ? "0"+ d : d;
    return (outD + " " + months[timestamp.getMonth()] + " " + timestamp.getFullYear());
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

  selectSettings() {
    this.navCtrl.push(SettingsPage, {
     });
  }

  

  

}

