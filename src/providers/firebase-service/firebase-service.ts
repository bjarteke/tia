import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import 'firebase/firestore';
import { AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the FirebaseServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

interface Items {
 Startdato: string;
 Starttid: string;
 Start;
 Sluttdato: string;
 Sluttid: string;
 Slutt: string;
 Added: string;
}

@Injectable()
export class FirebaseServiceProvider {
  public itemsCollection: AngularFirestoreCollection<Items>;

  public allRecords = [];

  public upcoming = [];
  public upcoming2 = []; //One list for each week number 
  public previous = []; 

  public planNext = [];
  public currentID = "testID";
  public counter = 0;

  public weeknumbers = [];
  public uniqueWeeknumbers = [];

  constructor(public afd: AngularFirestore) {
    this.afd.collection<Items>('arbeidsokter', ref => ref.orderBy('Start'))
      .valueChanges()
      .subscribe ((data) => this.inTheFuture(data));
  }

  inTheFuture(data){
    var currentDate = new Date();
    this.allRecords = data;
    console.log(this.allRecords);
    for (var x = 0; x< this.allRecords.length; x++) {
      var dateStart = new Date(this.allRecords[x]["Start"]);
      var dateEnd = new Date(this.allRecords[x]["Slutt"]);
      if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
        if (this.planNext.length == 0) {
          this.planNext.push(this.allRecords[x]);
        }
        else {
          this.upcoming.push(this.allRecords[x]);
          if (this.getWeekNumber(dateStart) == this.getWeekNumber(currentDate)){
            this.weeknumbers.push("Denne uken")
          }
          else if (this.getWeekNumber(dateStart) - this.getWeekNumber(currentDate) == 1){
            this.weeknumbers.push("Neste uke")
          }
          else {
            this.weeknumbers.push("Uke " + this.getWeekNumber(dateStart));
          }
        }
      }
      else {
        this.previous.push(this.allRecords[x]);
      }
    }
    this.previous.reverse();
    this.uniqueWeeknumbers.push(this.weeknumbers[0]);

    var temp = [];
    for (var i = 0; i<this.weeknumbers.length; i++){
      if (this.weeknumbers[i] == this.weeknumbers[i+1]) {
        temp.push(this.upcoming[i])
      }
      else {
        temp.push(this.upcoming[i])
        this.upcoming2.push(temp);
        temp = [];
      }
    }
    for (var y = 1; y < this.weeknumbers.length; y++) {


      if (this.weeknumbers[y]!=this.weeknumbers[y-1]){
        this.uniqueWeeknumbers.push(this.weeknumbers[y]);
      }
    }
    console.log(this.uniqueWeeknumbers);
    console.log(this.getCurrentID());
  }

  getWeekNumber(date) {
   date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
  
  }

  addCheckInOutTime(timestamp){
    var hei = "stempletid"
    this.afd.collection("stempletider").doc("stempling").collection("this.currentID").doc(this.counter.toString()).set({
      stempletid : timestamp
    })
    .then(function() {
      console.log("CheckInOut successfully written")
    })
    .catch(function(error){
      console.error("Error when writing CheckInOut: ", error)
    });
    this.counter = this.counter + 1;

  }

  getCurrentID() {
     var docID = (this.afd.collection<Items>("arbeidsokter", ref => ref.where("Start", "==", this.planNext[0]["Start"])).valueChanges());

    console.log("Hei");
    console.log(docID);
  }

}
