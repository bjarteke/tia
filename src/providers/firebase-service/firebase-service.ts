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
 ID: string;
 Startdato: string;
 Stempletider;
 Starttid: string;
 Start;
 Sluttdato: string;
 Sluttid: string;
 Slutt: string;
 Added: string;
}

@Injectable()
export class FirebaseServiceProvider {
  public testList = [];


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
    /* Retrieving data from Firestore */
    this.afd.collection<Items>('arbeidsokter', ref => ref.orderBy('Start'))
      .valueChanges()
      .subscribe ((data) => this.inTheFuture(data));
  }

  inTheFuture(data){
    this.resetArrays();
    var currentDate = new Date();
    this.allRecords = data;
    /* Iterating through all records within the plan, in order to separate them between previous and upcoming*/
    for (var x = 0; x< this.allRecords.length; x++) {
      var dateStart = new Date(this.allRecords[x]["Start"]);
      var dateEnd = new Date(this.allRecords[x]["Slutt"]);
      /* A record has a start date in the future, or it is still not finished*/
      if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
        /* The first future record is added to the planNext in order to be shown in the top panel on the home page*/
        if (this.planNext.length == 0) {
          this.planNext.push(this.allRecords[x]);
        }
        /* All future records except the first one */
        else {
          /* Adding the future records to the array of upcoming plans, and making sure that the next record is not added to the upcoming array */
          if(this.planNext[0]["ID"] != this.allRecords[x]["ID"]) {
              this.upcoming.push(this.allRecords[x]);
            /* Adding information about the week number to the week number array. */
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
      }
      /* If not a future record, place it in the previous array */
      else {
        this.previous.push(this.allRecords[x]);
      }
    }
    /* Reverst the array of previous records, such that the newest comes first */
    this.previous.reverse();

    /* Adding the first week number to an array of unique Weeknumbers. Used to group the future records on the home page */
    this.uniqueWeeknumbers.push(this.weeknumbers[0]);

    /* Create a new 3D matrix called upcoming2, where we all future records within one week are place in the same array. Used to group the future records on the home page */ 
    var temp = [];
    console.log(this.upcoming);
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

    /* Adding all unique week numbers to the array */
    for (var y = 1; y < this.weeknumbers.length; y++) {
      if (this.weeknumbers[y]!=this.weeknumbers[y-1]){
        this.uniqueWeeknumbers.push(this.weeknumbers[y]);
      }
    }
  }

  /* Calculating the week number of a date object given as a parameter */
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

  /* Sending a check in or check out time to the Firestore */
  addCheckInOutTime(timestampArray){
    var oldTimestamps = [];
    var newTimestamps = [];
    
  

    this.afd.collection<Items>('arbeidsokter').doc(this.planNext[0]["ID"])
      .valueChanges()
      .forEach((data) => oldTimestamps.push(data));
      
    //oldTimestamps.values("Stempletider").map((item) => console.log(item))
    
    console.log("HER");
    Object.keys(oldTimestamps).map(key => console.log(oldTimestamps[key]));




    this.afd.collection("arbeidsokter").doc(this.planNext[0]["ID"]).update({
      "Stempletider" : timestampArray
    })
    .then(function() {
      console.log("CheckInOut successfully written")
    })
    .catch(function(error){
      console.error("Error when writing CheckInOut: ", error)
    });
    this.counter = this.counter + 1;

  }

  /* Reseting all arrays */
  resetArrays(){
    this.upcoming = [];
    this.upcoming2 = []; 
    this.previous = []; 
    this.weeknumbers = [];
    this.uniqueWeeknumbers = [];
  }

  getCurrentID() {
     var docID = (this.afd.collection<Items>("arbeidsokter", ref => ref.where("Start", "==", this.planNext[0]["Start"])).valueChanges());

    console.log("Hei");
    console.log(docID);
  }

}
