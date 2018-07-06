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

  public plan:Array<any>=[];

  constructor(public http: HttpClient) {
    this.http.get('../assets/data/arbeidsplan.json').subscribe(data => {
      this.plan.push(data);
          });
  }
  

}
