import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';

import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { HomePage } from '../home/home';
import { SettingsPage } from '../settings/settings';


import firebase from 'firebase';
import 'firebase/firestore';
import { AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';

import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  item:any;
  startDato:any;
  startTid:any;
  sluttDato:any;
  sluttTid;
  segmentWidth = [];
  toggleStempletider = false;
 
  segmentWidthPlan = []
  seconds;
  lateWidth = "0%";
  totalWidthSoFar = 0;
  totalWidthSoFarPlan = 0;

  newStempletider = new Array(); //used for loading bar
  sendingStempletider = new Array(); //used for editing
  msg = "";
  timeStarts = '08:00';
  datePicker;

  
  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseService : FirebaseServiceProvider, public afd: AngularFirestore, public toastCtrl: ToastController) {
    this.item = this.navParams.get('item');
    for (var x = 0; x<this.item.Stempletider.length; x++){
      this.newStempletider.push(this.item.Stempletider[x]);
    }
    if(this.newStempletider[this.newStempletider.length - 1] != this.item.Slutt) {
      this.newStempletider.push(this.item.Slutt);
    }    
    this.newStempletider.sort();

    this.sendingStempletider = this.item.Stempletider.sort();
    this.init();
    
  }

  init() {
    /* Adding the end time to the "Stempletider" array (making sure that it is not already added) */
   

    /* Calculate the duration of the work session, measured in seconds */
    this.seconds = ((new Date (this.newStempletider[this.newStempletider.length-1])).getTime()/1000 - (new Date (this.item.Start)).getTime()/1000);

    /* Setting the lateWidth variable if check in was done too late */
    if(100*(Math.abs((+new Date(this.newStempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds) > 0) {
      this.lateWidth = (100*(Math.abs((+new Date(this.newStempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds)) + "%";     
    }

    /* Calculate the segment widths of the loading bar */
    this.totalWidthSoFar = parseFloat(this.lateWidth.slice(0,-1));
    for (var x=0; x<this.newStempletider.length - 1; x++){
      var temp = Math.min(100-this.totalWidthSoFar,100*(Math.abs((+new Date(this.newStempletider[x+1]) - +new Date(this.newStempletider[x]))/1000)/this.seconds));
      this.totalWidthSoFar += temp;
      this.segmentWidth.push(temp + "%");      
    }
  }
  timestampToDate2(timestamp){
    timestamp = new Date(timestamp);
    var months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august" , "september" , "oktober" , "november" , "desember" ]
    var d = timestamp.getDate();
    var outD = (d<10) ? "0"+ d : d;
    return (outD + ". " + months[timestamp.getMonth()] + " " + timestamp.getFullYear());
  }

  fromTimestampToHHMM2(timestamp) {
    var date = new Date(timestamp);
    var m = Math.abs((new Date (date).getMinutes()));
    var h = Math.abs((new Date (date).getHours()));

    var outH = ""+h;
    var outM = ""+m;

    outH = (h<10) ? "0"+ h : outH;
    outM = (m<10) ? "0"+ m : outM;

    return (outH + ":" + outM);
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

  inTheFuture() {
    var currentDate = new Date();
    var startDate = new Date(this.item.Start);
    return (startDate.getTime() > currentDate.getTime());
  }

  alreadyInList(d){
    for (var x=0; x<this.sendingStempletider.length;x++){
      if (new Date(this.sendingStempletider[x]).getMinutes() == d.getMinutes() && new Date(this.sendingStempletider[x]).getHours() == d.getHours() ){
        return true;
      }
    }
    return false;
  }

  editTimestamps() {
    //this.toggleStempletider = true;
    //this.newStempletider = this.item.Stempletider;
  }

  deleteTimestamp(x) {
    this.sendingStempletider.splice(x,1);
  }

  addTimestamp(timestamp) {
    var d = new Date(this.item.Start);
    var h = this.timeStarts.slice(0,2);
    var m = this.timeStarts.slice(3,5);
    d.setUTCHours(parseInt(h)-2);
    d.setUTCMinutes(parseInt(m));
    if(!this.alreadyInList(d)){
      this.sendingStempletider.push(d);
      this.sendingStempletider.sort();
    }
    else {
      this.toast('FEIL: Allerede lagt til stempling på dette tidspunktet',3000,"toast-failed");
    }
  }

  sortStempletider() {
    for (var y = 0; y<this.newStempletider.length; y++) {
    for (var x = 0; x<this.newStempletider.length-1; x++) {
      if(new Date(this.newStempletider[x]).getTime() > new Date(this.newStempletider[x+1]).getTime()){
        var temp = this.newStempletider[x];
        this.newStempletider[x] = this.newStempletider[x+1];
        this.newStempletider[x+1] = temp;
      }
    }
    }
  }

  toast(text, duration, css){
    const toast = this.toastCtrl.create({
        message: text,
        duration: duration,
        position: 'top',
        cssClass: css
      });
    toast.present();
  }

  sendChangesHandler() {
    if(this.sendChanges()){
      console.log("RETURNERTE TRUE");
      this.toast('Endringer sendt til godkjenning',3000,"toast-success");
    }
  }

  sendChanges() {
    /* Error handling */
    console.log("SEND CHANGES");
    console.log(this.sendingStempletider);
    if (this.msg == "") {
      this.toast('FEIL: Beskriv årsak til endring',3000,"toast-failed");
    }
    if (this.sendingStempletider.length %2 != 0) {
      this.toast('FEIL: Det må være like mange inn- og utstemplinger',5000,"toast-failed");
    }


    /* Creating an array consisting of old and new change messages */
    var listEndretMelding = [];
    if(this.item.EndretMelding.length > 0){
      for (var i = 0; i<this.item.EndretMelding.length ; i++){
        listEndretMelding.push(this.item.EndretMelding[i]);
      }
      listEndretMelding.push(this.msg);

    }
    else {
      listEndretMelding.push(this.msg);
    }
    console.log("KOM HIT");


    /* Sending */
    if(this.msg != "" && this.sendingStempletider.length %2 == 0) {
      return this.afd.collection("arbeidsokter").doc(this.item.ID).update({
        "Stempletider" : this.sendingStempletider,
        "EndretMelding" : listEndretMelding
      })
      .then(function() {
        return true;
      })
      .catch(function(error){
        console.error("Error when editing CheckInOut: ", error);
        return false;
      });
    }
  }

  selectBackground(i){
    if(i%2 == 0){
      return "repeating-linear-gradient(-45deg,#7CFC00,#7CFC00 10px,#4EFC00 10px,#4EFC00 20px)";
    }
    else {
      return "repeating-linear-gradient(-45deg,#a00b0b,#a00b0b 10px,#c00b0b 10px,#c00b0b 20px)";
    }
  }

  toggleStemple(){
    if(this.toggleStempletider) {
      this.toggleStempletider = false;
    }
    else {
      this.toggleStempletider = true;
    }
  }

  selectSettings() {
    this.navCtrl.push(SettingsPage, {
     });
  }

}
