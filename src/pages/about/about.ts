import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public toggle1 = false;
  public toggle2 = false;
  

  constructor(public navCtrl: NavController) {

  }

  toggle(){
    if (this.toggle1) {
      this.toggle1 = false;
    }
    else {
      this.toggle1 = true;
    }
  }

  toggle21(){
    if (this.toggle2) {
      this.toggle2 = false;
    }
    else {
      this.toggle2 = true;
    }
  }

}
