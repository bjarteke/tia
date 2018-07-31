import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { HomePage } from '../home/home';

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


   marginWidthTop = [];
  marginWidthBottom = [];
  stempletiderTop = [];
  stempletiderBottom = [];

  newStempletider = new Array();
  msg = "";
  timeStarts = '08:00';

  
  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseService : FirebaseServiceProvider, public afd: AngularFirestore, public toastCtrl: ToastController) {
    this.item = this.navParams.get('item');
    this.startTid = this.item.Starttid;
    this.sluttTid = this.item.Sluttid;
    this.startDato = this.item.Startdato;
    this.sluttDato = this.item.Sluttdato;
    for (var x = 0; x<this.item.Stempletider.length; x++){
      this.newStempletider.push(this.item.Stempletider[x]);
    }
    this.newStempletider.sort();
    this.init();
    
  }

  init() {
    /* Adding the end time to the "Stempletider" array (making sure that it is not already added) */
    console.log(this.item.Stempletider);

    if(this.item.Stempletider[this.item.Stempletider.length - 1] != this.item.Slutt && new Date(this.item.Stempletider[this.item.Stempletider.length - 1]).getTime() < new Date(this.item.Slutt).getTime()){
      this.item.Stempletider.push(this.item.Slutt);
    }

    /* Calculate the duration of the work session, measured in seconds */
    this.seconds = ((new Date (this.item.Stempletider[this.item.Stempletider.length-1])).getTime()/1000 - (new Date (this.item.Start)).getTime()/1000);

    /* Setting the lateWidth variable if check in was done too late */
    if(100*(Math.abs((+new Date(this.item.Stempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds) > 0) {
      this.lateWidth = (100*(Math.abs((+new Date(this.item.Stempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds)) + "%";     
    }

    /* Calculate the segment widths of the loading bar */
    this.totalWidthSoFar = parseFloat(this.lateWidth.slice(0,-1));
    for (var x=0; x<this.item.Stempletider.length - 1; x++){
      var temp = Math.min(100-this.totalWidthSoFar,100*(Math.abs((+new Date(this.item.Stempletider[x+1]) - +new Date(this.item.Stempletider[x]))/1000)/this.seconds));
      console.log("ITERASJON");
      console.log(this.item.Stempletider);
      this.totalWidthSoFar += temp;
      this.segmentWidth.push(temp + "%");      
    }
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
    for (var x=0; x<this.newStempletider.length;x++){
      if (new Date(this.newStempletider[x]).getMinutes() == d.getMinutes() && new Date(this.newStempletider[x]).getHours() == d.getHours() ){
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
    this.newStempletider.splice(x,1);
  }

  addTimestamp(timestamp) {
    var d = new Date(this.item.Start);
    var h = this.timeStarts.slice(0,2);
    var m = this.timeStarts.slice(3,5);
    d.setUTCHours(parseInt(h)-2);
    d.setUTCMinutes(parseInt(m));
    if(!this.alreadyInList(d)){
      this.newStempletider.push(d);
      this.newStempletider.sort();
    }
    else {
      this.toastCtrl.create({
        message: 'FEIL: Allerede lagt til',
        duration: 3000,
        position: 'top'
      }).present();
    }
  }

  sortStempletider() {
    console.log(this.newStempletider);
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

  toast(text, duration){
    const toast = this.toastCtrl.create({
        message: text,
        duration: duration,
        position: 'top'
      });
    toast.present();
  }

  sendChangesHandler() {
    if(this.sendChanges()){
      this.toast('Endringer sendt til godkjenning',3000);
    }
    else {
      this.toast('FEIL: Noe gikk galt. Sjekk internett-tilkoblingen din',5000);
    }
  }

  sendChanges() {
    /* Error handling */
    if (this.msg == "") {
      this.toast('FEIL: Beskriv årsak til endring',3000);
    }
    if (this.newStempletider.length %2 == 0) {
      this.toast('FEIL: Det må være like mange inn- og utstemplinger',5000);
    }

    /* Creating an array consisting of old and new change messages */
    var listEndretMelding = [];
    if(this.item.EndretMelding != undefined) {
      listEndretMelding.push(this.item.EndretMelding);
    }
    listEndretMelding.push(this.msg);

    /* Sending */
    if(this.msg != "" && this.newStempletider.length %2 != 0) {
      return this.afd.collection("arbeidsokter").doc(this.item.ID).update({
        "Stempletider" : this.newStempletider,
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

}
