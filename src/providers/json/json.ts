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

  /* All data from JSON file */
  public plan:Array<any>=[];
  public test = [];
  public keys = [];

  /* Upcoming */
  public planUpcoming: Array<any>=[];
  public planDataUpcoming = [];

  /* Previous */
  public planPrevious: Array<any>=[];
  public planDataPrevious = [];

  public planNext = [];

  constructor(public http: HttpClient) {
    this.http.get('../assets/data/arbeidsplan.json').subscribe(data => {
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
        }
      }
      else {
        this.planDataPrevious.push(this.test[x]);
      }
    }
    this.planDataPrevious.reverse();
    console.log(this.planNext);
  }
  

}
