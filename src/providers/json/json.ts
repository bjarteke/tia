import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the JsonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class JsonProvider {

  public weeknumbers = [];
  public uniqueWeeknumbers = [];

  /* All data from JSON file */
  public plan:Array<any>=[];
  public test = [];
  public keys = [];

  /* Upcoming */
  public planUpcoming: Array<any>=[];
  public planDataUpcoming = [];
  public planDataUpcoming2 = [];


  /* Previous */
  public planPrevious: Array<any>=[];
  public planDataPrevious = [];

  public planNext = [];

  constructor(public http: HttpClient) {
    this.http.get('../www/assets/data/arbeidsplan.json').subscribe(data => {
    this.plan.push(data);
    this.test = this.plan[0];
    this.keys = Object.keys(this.plan[0]); 
    this.updateArrays();
          });
  }

  updateArrays(){
    var currentDate = new Date();
    for (var x in this.test) {
      var dateStart = new Date(this.test[x]["Start"]);
      var dateEnd = new Date(this.test[x]["Slutt"]);
      if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
        if (this.planNext.length == 0) {
          this.planNext.push(this.plan[0][x]);
        }
        else {
          this.planDataUpcoming.push(this.plan[0][x])
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
        this.planDataPrevious.push(this.test[x]);
      }
    }
    this.planDataPrevious.reverse();
            this.uniqueWeeknumbers.push(this.weeknumbers[0]);

    var temp = [];
    for (var i = 0; i<this.weeknumbers.length; i++){
      if (this.weeknumbers[i] == this.weeknumbers[i+1]) {
        temp.push(this.planDataUpcoming[i])
      }
      else {
        temp.push(this.planDataUpcoming[i])
        this.planDataUpcoming2.push(temp);
        temp = [];
      }
      console.log(this.planDataUpcoming2);

    }


    for (var y = 1; y < this.weeknumbers.length; y++) {


      if (this.weeknumbers[y]!=this.weeknumbers[y-1]){
        this.uniqueWeeknumbers.push(this.weeknumbers[y]);
      }
    }


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

  showWeekNumber(i) {
    if (i==0) {
      return true;
    }
    else if (this.weeknumbers[i] == this.weeknumbers[i-1]){
      return false;
    }
    else {
      return true;
    }
  }
  

}
