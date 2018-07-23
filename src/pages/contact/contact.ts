import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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
  
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.item = navParams.get('item');
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

}
