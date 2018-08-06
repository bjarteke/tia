import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';

import 'firebase/firestore';
import { AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';

import { NotificationsProvider } from '../notifications/notifications';

import { ToastController } from 'ionic-angular';

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

interface Settings {
  enableNotifications: boolean;
  autoCheckIn: boolean;
  earlyCheckInMinutes: number;
  timeFromArrivalToCheckIn: number;
  address : string;
  number : string;
  polygon;
}

@Injectable()
export class FirebaseServiceProvider {
  public testList = [];


  public itemsCollection: AngularFirestoreCollection<Items>;

  public allRecords = [];

  public upcoming = [];
  public upcoming2 = []; //One list for each week number 
  public previous = []; 

  public counter = 0;

  public weeknumbers = [];
  public uniqueWeeknumbers = [];

  public checkedIn: boolean = false;

  public doneInitial = false;

  public settingsData = [];


  //* SETTINGS *//
  public earlyCheckInMinutes;
  public enableNotifications;
  public autoCheckIn;
  public timeFromArrivalToCheckIn;
  public address;
  public number;
  public polygon;

  constructor(public afd: AngularFirestore, public notifications: NotificationsProvider, public toastCtrl: ToastController) {
    /* Retrieving data from Firestore */
    this.afd.collection<Items>('arbeidsokter', ref => ref.orderBy('Start'))
      .valueChanges()
      .subscribe ((data) => this.inTheFuture(data));
    this.setSettings();
  }

  inTheFuture(data){
    console.log(data);
    this.resetArrays();
    var currentDate = new Date();
    this.allRecords = data;
    /* Iterating through all records within the plan, in order to separate them between previous and upcoming*/
    for (var x = 0; x< this.allRecords.length; x++) {
      var dateStart = new Date(this.allRecords[x]["Start"]);
      var dateEnd = new Date(this.allRecords[x]["Slutt"]);
      /* A record has a start date in the future, or it is still not finished*/
      if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
        /* Adding the future records to the array of upcoming plans, and making sure that the next record is not added to the upcoming array */
        this.upcoming.push(this.allRecords[x]);
        console.log(this.allRecords[x]);
        /* Adding information about the week number to the week number array. */
        if (this.getWeekNumber(dateStart) == this.getWeekNumber(currentDate)){
          this.weeknumbers.push("Denne uken");
        }
        else if (this.getWeekNumber(dateStart) - this.getWeekNumber(currentDate) == 1){
          this.weeknumbers.push("Neste uke");
        }
        else {
          this.weeknumbers.push("Uke " + this.getWeekNumber(dateStart));
        }
      }
      
      /* If not a future record, place it in the previous array */
      else {
        this.previous.push(this.allRecords[x]);
      }
    }

    console.log("DATA");
    console.log(this.upcoming);

    /* Reverst the array of previous records, such that the newest comes first */
    this.previous.reverse();

    /* Adding the first week number to an array of unique Weeknumbers. Used to group the future records on the home page */
    this.uniqueWeeknumbers.push(this.weeknumbers[0]);
    console.log("Ukenummer");
    console.log(this.weeknumbers);

    /* Create a new 3D matrix called upcoming2, where we all future records within one week are place in the same array. Used to group the future records on the home page */ 
    var temp = [];
    //console.log(this.upcoming);
    for (var i = 1; i<this.weeknumbers.length; i++){
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

    this.doneInitial = true;
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
    
    newTimestamps = this.upcoming[0]["Stempletider"];
    newTimestamps.push(timestamp);
      
    this.afd.collection("arbeidsokter").doc(this.upcoming[0]["ID"]).update({
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
    this.afd.collection('arbeidsokter').doc(this.upcoming[0]['ID']).update({
      'checkedIn': checkedIn
    })
    .then(function() {
      console.log("checkedIn-variable successfully written")
    })
    .catch(function(error){
      console.error("Error when writing checkedIn-variable: ", error)
    });
  }

  byttOkt(array1Index, array2Index) {
    console.log("BYTT OKT");
    console.log(array1Index);
    console.log(array2Index);
    var bytte;
    if(this.upcoming2[array1Index][array2Index]['byttes'] == undefined){
      console.log("FØRSTE IF");
      bytte = true;
      this.upcoming2[array1Index][array2Index]['byttes'] = true;
    }
    else {
      if (this.upcoming2[array1Index][array2Index]['byttes'] == false){
        console.log("ANDRE IF");
        bytte = true;
        this.upcoming2[array1Index][array2Index]['byttes'] = true;
      }
      else {
        console.log("ELSE");
        bytte = false;
        this.upcoming2[array1Index][array2Index]['byttes'] = false;
      }
    }
    console.log(this.upcoming2);

    this.afd.collection('arbeidsokter').doc(this.upcoming2[array1Index][array2Index]['ID']).update({
      'byttes' : bytte,
      'Start' : this.upcoming2[array1Index][array2Index]['Start'],
      'Slutt' : this.upcoming2[array1Index][array2Index]['Slutt'],
      'Added' : this.upcoming2[array1Index][array2Index]['Added'],
      'EndretMelding' : this.upcoming2[array1Index][array2Index]['EndretMelding']
    })
    .then(function() {
      console.log("bytte successfully written")
    })
    .catch(function(error){
      console.error("Error when writing bytte: ", error)
    });
  }

  getCheckedIn(){
    console.log("GETCHECKED IN");
    console.log(this.upcoming);
    this.afd.collection('arbeidsokter').doc(this.upcoming[0]['ID'])
      .valueChanges()
      .subscribe(data => {
        this.checkedIn =  data['checkedIn'];
      });
  }

  writeArrivalTime(timestamp){
    this.afd.collection("arbeidsokter").doc(this.upcoming[0]["ID"]).update({
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

  isWorking(timestamp) {
    //Will take in a timestamp and check if this matches a block that is scheduled for work. 
    var nextStartTime = new Date(this.upcoming[0]['Start']);
    var now = new Date(timestamp);
    //Checks if it's the same date and if we are still in before the end of the workday. 
    if (nextStartTime.getMonth() == now.getMonth() && nextStartTime.getDate() == now.getDate() && (now.getTime() - new Date(this.upcoming[0]['Slutt']).getTime()) < 0) {
      return true;
    }
    return false;
  }

  decideCheckInTime(arrivedAtWork){
    //600000 ms er 10 minutter
    var buffer = 5000;
    
    arrivedAtWork = new Date(arrivedAtWork);

    var workStart = new Date(this.upcoming[0]['Start']);


    //Kommer på jobb før 10 min før oppstart. Skal da sjekke deg inn ved oppstart. 
    if (workStart.getTime() - arrivedAtWork.getTime() > buffer){
      this.addCheckInOutTime(workStart);
      if(this.enableNotifications){
        this.notifications.sendNotification('arrive_early', workStart);
      }
      return workStart;
    }

    //Kommer på jobb etter 10 minutter før. Skal da sjekke deg inn 10 minutter etter.
    else if(workStart.getTime() - arrivedAtWork.getTime() < buffer){
      var checkInTime = arrivedAtWork.getTime() + buffer;
      checkInTime = new Date(checkInTime);
      this.addCheckInOutTime(checkInTime)
      if (this.enableNotifications){
        this.notifications.sendNotification('arrive_late', checkInTime);
      }
      return checkInTime;
    } 

  }

  /* SETTINGS */

  updateSettingsHandler(earlyCheckInMinutes,automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications) {
    if(this.updateSettings(earlyCheckInMinutes,automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications)){
      this.toast('Innstillinger lagret',2000,"toast-success");
    }
  }

  updateSettings(earlyCheckInMinutes,automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications){
    this.afd.collection("settings").doc("6uSk7azHsXowUL2BSy8i").update({
      "earlyCheckInMinutes" : earlyCheckInMinutes,
      "automaticCheckIn" : automaticCheckIn,
      "timeFromArrivalToCheckIn" : timeFromArrivalToCheckIn,
      "polygon" : this.polygon,
      "address" : address,
      "postalCode" : number,
      "enableNotifications" : enableNotifications
    })
    .then(function() {
      console.log("earlyCheckMinutes successfully written");
      return true;
    })
    .catch(function(error){
      console.error("Error when writing earlyCheckMinutes: ", error);
      return false;
    });
  }

  updateAutomaticSetting(value){
    this.afd.collection("settings").doc("6uSk7azHsXowUL2BSy8i").update({
      'automaticCheckIn' : value
    });
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

  setSettings(){
    var settings = [];
    this.afd.collection<Settings>("settings").doc("6uSk7azHsXowUL2BSy8i").valueChanges()
    .subscribe((data) => this.setSettings2(data))
  }

  setSettings2(data){
    this.settingsData = data;
    this.earlyCheckInMinutes = this.settingsData["earlyCheckInMinutes"];
    this.enableNotifications = this.settingsData['enableNotifications'];
    this.autoCheckIn = this.settingsData["automaticCheckIn"];
    this.timeFromArrivalToCheckIn = this.settingsData["timeFromArrivalToCheckIn"];
    this.polygon = this.settingsData["polygon"];
    this.number = this.settingsData["postalCode"];
    this.address = this.settingsData["address"];
  }

  /*calculateDelay(){
    var delaySeconds = 0;
    for (var x = 0; x<this.previous.length; x++){
      delaySeconds += +new Date(this.previous.Stempletider[0]) - +(new Date(this.previous.arrivedAtWork));
    }
    delaySeconds = delaySeconds/this.previous.length;
  }*/

}
