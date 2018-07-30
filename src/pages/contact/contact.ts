import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { HomePage } from '../home/home';


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
 
  segmentWidthPlan = []
  seconds;
  lateWidth = "0%";
  totalWidthSoFar = 0;
  totalWidthSoFarPlan = 0;


   marginWidthTop = [];
  marginWidthBottom = [];
  stempletiderTop = [];
  stempletiderBottom = [];


  
  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseService : FirebaseServiceProvider) {

    this.item = navParams.get('item');
    this.item.Stempletider.push(this.item.Slutt);
    this.seconds = ((new Date (this.item.Stempletider[this.item.Stempletider.length-1])).getTime()/1000 - (new Date (this.item.Start)).getTime()/1000) //Number of seconds


    if(100*(Math.abs((+new Date(this.item.Stempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds) > 0) {
      this.lateWidth = (100*(Math.abs((+new Date(this.item.Stempletider[0]) - +new Date(this.item.Start))/1000)/this.seconds)) + "%";     
    }

    this.totalWidthSoFar = parseFloat(this.lateWidth.slice(0,-1));

    var planTimes = [new Date(this.item.Start), new Date(this.item.lunsj), new Date(new Date(this.item.lunsj).getTime() + 30*60000), new Date(this.item.Slutt)];
    console.log(planTimes);
    for (var x=0; x<3; x++){
      var temp = Math.min(100-this.totalWidthSoFarPlan,100*(Math.abs((+planTimes[x+1] - +planTimes[x])/1000)/this.seconds));
      this.totalWidthSoFarPlan += temp;
      this.segmentWidthPlan.push(temp + "%")
    }

    console.log(this.segmentWidthPlan);

    for (var x=0; x<this.item.Stempletider.length - 1; x++){
      var temp = Math.min(100-this.totalWidthSoFar,100*(Math.abs((+new Date(this.item.Stempletider[x+1]) - +new Date(this.item.Stempletider[x]))/1000)/this.seconds));
      this.totalWidthSoFar += temp;
      this.segmentWidth.push(temp + "%");
      console.log("ITERASJON");

      console.log(this.segmentWidth);
      console.log(this.totalWidthSoFar);
      
    }
    for (var x=0; x<this.item.Stempletider.length-1; x++) {
    var totalWidthSoFarTop = 0;

      if (x%2==0) {
        if(x==0){
          this.marginWidthTop.push(this.lateWidth);
        }
        else {
          var temp = Math.min(100-totalWidthSoFarTop,100*(Math.abs((+new Date(this.item.Stempletider[x+1]) - +new Date(this.item.Stempletider[x-1]))/1000)/this.seconds));
          this.marginWidthTop.push(temp - 20 + "%");
        }
        this.stempletiderTop.push(this.item.Stempletider[x]);
            totalWidthSoFarTop += temp;

      }  
    }

    for (var x = 0; x<this.item.Stempletider.length; x++) {
      var totalWidthSoFarBottom = 0;
      if(x%2 != 0) {
        if(x==1){
          var temp = Math.min(100-totalWidthSoFarBottom,100*(Math.abs((+new Date(this.item.Stempletider[1]) - +new Date(this.item.Stempletider[0]))/1000)/this.seconds));
          this.marginWidthBottom.push(parseFloat(this.marginWidthTop[0].slice(0,-1)) + temp -4  + "%");
        }
        else{
          var temp = Math.min(100-totalWidthSoFarBottom,100*(Math.abs((+new Date(this.item.Stempletider[x]) - +new Date(this.item.Stempletider[x-1]))/1000)/this.seconds));
          this.marginWidthBottom.push(temp - 15 + "%");
        }
        this.stempletiderBottom.push(this.item.Stempletider[x]);
            totalWidthSoFarBottom += temp;

      }
    }
    console.log("Dette stedet");
    console.log(this.marginWidthTop);
    console.log(this.marginWidthBottom);
    console.log(this.stempletiderBottom);


    this.startTid = this.item.Starttid;
    this.sluttTid = this.item.Sluttid;
    this.startDato = this.item.Startdato;
    this.sluttDato = this.item.Sluttdato;
  }

  showEditButton(item){
    var currentDate = new Date();
    var endDate = new Date(item.Slutt);
    return endDate.getTime() < currentDate.getTime();
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

  editTimestamp(timestamp) {

  }

  selectBackground(i){
    if(i%2 == 0){
      return "repeating-linear-gradient(-45deg,#7CFC00,#7CFC00 10px,#4EFC00 10px,#4EFC00 20px)";
    }
    else {
      return "repeating-linear-gradient(-45deg,#a00b0b,#a00b0b 10px,#c00b0b 10px,#c00b0b 20px)";
    }
  }

}
