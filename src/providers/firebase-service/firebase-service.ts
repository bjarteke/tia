import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import 'firebase/firestore';
import { AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { NotificationsProvider } from '../notifications/notifications';
import { getScrollData } from '../../../node_modules/ionic-angular/umd/components/input/input';

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
 arrivedAtWork: boolean;
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

  public checkedIn: boolean = false;


  constructor(public afd: AngularFirestore, public notifications: NotificationsProvider) {
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
    //console.log(this.upcoming);
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
  addCheckInOutTime(timestamp){
    var oldTimestamps:Array<any> = [];
    var newTimestamps = [];
    
    newTimestamps = this.planNext[0]["Stempletider"];
    newTimestamps.push(timestamp);
      
    this.afd.collection("arbeidsokter").doc(this.planNext[0]["ID"]).update({
      "Stempletider" : newTimestamps
    })
    .then(function() {
      console.log("CheckInOut successfully written")
    })
    .catch(function(error){
      console.error("Error when writing CheckInOut: ", error)
    });
    this.counter = this.counter + 1;

  }

  writeCheckedIn(checkedIn){
    this.afd.collection('arbeidsokter').doc(this.planNext[0]['ID']).update({
      'checkedIn': checkedIn
    })
    .then(function() {
      console.log("checkedIn-variable successfully written")
    })
    .catch(function(error){
      console.error("Error when writing checkedIn-variable: ", error)
    });
  }

  getCheckedIn(){
    this.afd.collection('arbeidsokter').doc(this.planNext[0]['ID'])
      .valueChanges()
      .subscribe(data => {
        this.checkedIn =  data['checkedIn'];
      });
  }

  writeArrivalTime(timestamp){
    this.afd.collection("arbeidsokter").doc(this.planNext[0]["ID"]).update({
      "arrivedAtWork" : timestamp
    })
    .then(function() {
      console.log("arrivedAtWork successfully written")
    })
    .catch(function(error){
      console.error("Error when writing arrivedAtWork: ", error)
    });
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

  isWorking(timestamp) {
    //Will take in a timestamp and check if this matches a block that is scheduled for work. 
    var nextStartTime = new Date(this.planNext[0]['Start']);
    var now = new Date(timestamp);
    //Checks if it's the same date and if we are still in before the end of the workday. 
    if (nextStartTime.getMonth() == now.getMonth() && nextStartTime.getDate() == now.getDate() && (now.getTime() - new Date(this.planNext[0]['Slutt']).getTime()) < 0) {
      return true;
    }
    return false;
  }

  decideCheckInTime(arrivedAtWork){
    //600000 ms er 10 minutter
    var buffer = 5000;
    
    arrivedAtWork = new Date(arrivedAtWork);

    var workStart = new Date(this.planNext[0]['Start']);


    //Kommer på jobb før 10 min før oppstart. Skal da sjekke deg inn ved oppstart. 
    if (workStart.getTime() - arrivedAtWork.getTime() > buffer){
      this.addCheckInOutTime(workStart);
      this.notifications.sendNotification('arrive_early', workStart);
      return workStart;
    }

    //Kommer på jobb etter 10 minutter før. Skal da sjekke deg inn 10 minutter etter.
    else if(workStart.getTime() - arrivedAtWork.getTime() < buffer){
      var checkInTime = arrivedAtWork.getTime() + buffer;
      checkInTime = new Date(checkInTime);
      this.addCheckInOutTime(checkInTime)
      this.notifications.sendNotification('arrive_late', checkInTime);
      return checkInTime;
    } 

  }

}
