webpackJsonp([2],{

/***/ 107:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FirebaseServiceProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_firestore__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_firebase_firestore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_firebase_firestore__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angularfire2_firestore__ = __webpack_require__(217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__notifications_notifications__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_ionic_angular__ = __webpack_require__(49);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var FirebaseServiceProvider = /** @class */ (function () {
    function FirebaseServiceProvider(afd, notifications, toastCtrl) {
        var _this = this;
        this.afd = afd;
        this.notifications = notifications;
        this.toastCtrl = toastCtrl;
        this.testList = [];
        this.allRecords = [];
        this.upcoming = [];
        this.upcoming2 = []; //One list for each week number 
        this.previous = [];
        this.planNext = [];
        this.currentID = "testID";
        this.counter = 0;
        this.weeknumbers = [];
        this.uniqueWeeknumbers = [];
        this.checkedIn = false;
        this.doneInitial = false;
        this.settingsData = [];
        /* Retrieving data from Firestore */
        this.afd.collection('arbeidsokter', function (ref) { return ref.orderBy('Start'); })
            .valueChanges()
            .subscribe(function (data) { return _this.inTheFuture(data); });
        this.setSettings();
    }
    FirebaseServiceProvider.prototype.inTheFuture = function (data) {
        this.resetArrays();
        var currentDate = new Date();
        this.allRecords = data;
        /* Iterating through all records within the plan, in order to separate them between previous and upcoming*/
        for (var x = 0; x < this.allRecords.length; x++) {
            var dateStart = new Date(this.allRecords[x]["Start"]);
            var dateEnd = new Date(this.allRecords[x]["Slutt"]);
            /* A record has a start date in the future, or it is still not finished*/
            if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
                /* The first future record is added to the planNext in order to be shown in the top panel on the home page*/
                if (this.planNext.length == 0) {
                    this.planNext.push(this.allRecords[x]);
                }
                else {
                    /* Adding the future records to the array of upcoming plans, and making sure that the next record is not added to the upcoming array */
                    if (this.planNext[0]["ID"] != this.allRecords[x]["ID"]) {
                        this.upcoming.push(this.allRecords[x]);
                        /* Adding information about the week number to the week number array. */
                        if (this.getWeekNumber(dateStart) == this.getWeekNumber(currentDate)) {
                            this.weeknumbers.push("Denne uken");
                        }
                        else if (this.getWeekNumber(dateStart) - this.getWeekNumber(currentDate) == 1) {
                            this.weeknumbers.push("Neste uke");
                        }
                        else {
                            this.weeknumbers.push("Uke " + this.getWeekNumber(dateStart));
                        }
                    }
                }
            }
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
        for (var i = 0; i < this.weeknumbers.length; i++) {
            if (this.weeknumbers[i] == this.weeknumbers[i + 1]) {
                temp.push(this.upcoming[i]);
            }
            else {
                temp.push(this.upcoming[i]);
                this.upcoming2.push(temp);
                temp = [];
            }
        }
        /* Adding all unique week numbers to the array */
        for (var y = 1; y < this.weeknumbers.length; y++) {
            if (this.weeknumbers[y] != this.weeknumbers[y - 1]) {
                this.uniqueWeeknumbers.push(this.weeknumbers[y]);
            }
        }
        this.doneInitial = true;
    };
    /* Calculating the week number of a date object given as a parameter */
    FirebaseServiceProvider.prototype.getWeekNumber = function (date) {
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    };
    /* Sending a check in or check out time to the Firestore */
    FirebaseServiceProvider.prototype.addCheckInOutTime = function (timestamp) {
        var oldTimestamps = [];
        var newTimestamps = [];
        newTimestamps = this.planNext[0]["Stempletider"];
        newTimestamps.push(timestamp);
        this.afd.collection("arbeidsokter").doc(this.planNext[0]["ID"]).update({
            "Stempletider": newTimestamps
        })
            .then(function () {
            console.log("CheckInOut successfully written");
        })
            .catch(function (error) {
            console.error("Error when writing CheckInOut: ", error);
        });
        this.counter = this.counter + 1;
    };
    FirebaseServiceProvider.prototype.writeCheckedIn = function (checkedIn) {
        this.afd.collection('arbeidsokter').doc(this.planNext[0]['ID']).update({
            'checkedIn': checkedIn
        })
            .then(function () {
            console.log("checkedIn-variable successfully written");
        })
            .catch(function (error) {
            console.error("Error when writing checkedIn-variable: ", error);
        });
    };
    FirebaseServiceProvider.prototype.getCheckedIn = function () {
        var _this = this;
        this.afd.collection('arbeidsokter').doc(this.planNext[0]['ID'])
            .valueChanges()
            .subscribe(function (data) {
            _this.checkedIn = data['checkedIn'];
        });
    };
    FirebaseServiceProvider.prototype.writeArrivalTime = function (timestamp) {
        this.afd.collection("arbeidsokter").doc(this.planNext[0]["ID"]).update({
            "arrivedAtWork": timestamp
        })
            .then(function () {
            console.log("arrivedAtWork successfully written");
        })
            .catch(function (error) {
            console.error("Error when writing arrivedAtWork: ", error);
        });
    };
    /* Reseting all arrays */
    FirebaseServiceProvider.prototype.resetArrays = function () {
        this.upcoming = [];
        this.upcoming2 = [];
        this.previous = [];
        this.weeknumbers = [];
        this.uniqueWeeknumbers = [];
    };
    FirebaseServiceProvider.prototype.getCurrentID = function () {
        var _this = this;
        var docID = (this.afd.collection("arbeidsokter", function (ref) { return ref.where("Start", "==", _this.planNext[0]["Start"]); }).valueChanges());
        console.log("Hei");
        console.log(docID);
    };
    FirebaseServiceProvider.prototype.isWorking = function (timestamp) {
        //Will take in a timestamp and check if this matches a block that is scheduled for work. 
        var nextStartTime = new Date(this.planNext[0]['Start']);
        var now = new Date(timestamp);
        //Checks if it's the same date and if we are still in before the end of the workday. 
        if (nextStartTime.getMonth() == now.getMonth() && nextStartTime.getDate() == now.getDate() && (now.getTime() - new Date(this.planNext[0]['Slutt']).getTime()) < 0) {
            return true;
        }
        return false;
    };
    FirebaseServiceProvider.prototype.decideCheckInTime = function (arrivedAtWork) {
        //600000 ms er 10 minutter
        var buffer = 5000;
        arrivedAtWork = new Date(arrivedAtWork);
        var workStart = new Date(this.planNext[0]['Start']);
        //Kommer på jobb før 10 min før oppstart. Skal da sjekke deg inn ved oppstart. 
        if (workStart.getTime() - arrivedAtWork.getTime() > buffer) {
            this.addCheckInOutTime(workStart);
            if (this.enableNotifications) {
                this.notifications.sendNotification('arrive_early', workStart);
            }
            return workStart;
        }
        else if (workStart.getTime() - arrivedAtWork.getTime() < buffer) {
            var checkInTime = arrivedAtWork.getTime() + buffer;
            checkInTime = new Date(checkInTime);
            this.addCheckInOutTime(checkInTime);
            if (this.enableNotifications) {
                this.notifications.sendNotification('arrive_late', checkInTime);
            }
            return checkInTime;
        }
    };
    FirebaseServiceProvider.prototype.updateSettingsHandler = function (earlyCheckInMinutes, automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications) {
        console.log("updateSettingshNdler");
        if (this.updateSettings(earlyCheckInMinutes, automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications)) {
            console.log("RETURNERTE TRUE");
            this.toast('Innstillinger lagret', 2000, "toast-success");
        }
    };
    FirebaseServiceProvider.prototype.updateSettings = function (earlyCheckInMinutes, automaticCheckIn, timeFromArrivalToCheckIn, address, number, enableNotifications) {
        this.afd.collection("settings").doc("6uSk7azHsXowUL2BSy8i").update({
            "earlyCheckInMinutes": earlyCheckInMinutes,
            "automaticCheckIn": automaticCheckIn,
            "timeFromArrivalToCheckIn": timeFromArrivalToCheckIn,
            "polygon": this.polygon,
            "address": address,
            "postalCode": number,
            "enableNotifications": enableNotifications
        })
            .then(function () {
            console.log("earlyCheckMinutes successfully written");
            return true;
        })
            .catch(function (error) {
            console.error("Error when writing earlyCheckMinutes: ", error);
            return false;
        });
    };
    FirebaseServiceProvider.prototype.updateAutomaticSetting = function (value) {
        this.afd.collection("settings").doc("6uSk7azHsXowUL2BSy8i").update({
            'automaticCheckIn': value
        });
    };
    FirebaseServiceProvider.prototype.toast = function (text, duration, css) {
        var toast = this.toastCtrl.create({
            message: text,
            duration: duration,
            position: 'top',
            cssClass: css
        });
        toast.present();
    };
    FirebaseServiceProvider.prototype.setSettings = function () {
        var _this = this;
        var settings = [];
        this.afd.collection("settings").doc("6uSk7azHsXowUL2BSy8i").valueChanges()
            .subscribe(function (data) { return _this.setSettings2(data); });
    };
    FirebaseServiceProvider.prototype.setSettings2 = function (data) {
        this.settingsData = data;
        this.earlyCheckInMinutes = this.settingsData["earlyCheckInMinutes"];
        this.enableNotifications = this.settingsData['enableNotifications'];
        this.autoCheckIn = this.settingsData["automaticCheckIn"];
        this.timeFromArrivalToCheckIn = this.settingsData["timeFromArrivalToCheckIn"];
        this.polygon = this.settingsData["polygon"];
        this.number = this.settingsData["postalCode"];
        this.address = this.settingsData["address"];
    };
    FirebaseServiceProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_3_angularfire2_firestore__["a" /* AngularFirestore */], __WEBPACK_IMPORTED_MODULE_4__notifications_notifications__["a" /* NotificationsProvider */], __WEBPACK_IMPORTED_MODULE_5_ionic_angular__["i" /* ToastController */]])
    ], FirebaseServiceProvider);
    return FirebaseServiceProvider;
}());

//# sourceMappingURL=firebase-service.js.map

/***/ }),

/***/ 118:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SettingsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_firebase_service_firebase_service__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(87);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
var SettingsPage = /** @class */ (function () {
    function SettingsPage(navCtrl, http, navParams, fsp, toastCtrl) {
        this.navCtrl = navCtrl;
        this.http = http;
        this.navParams = navParams;
        this.fsp = fsp;
        this.toastCtrl = toastCtrl;
        this.address = "";
        this.number = "";
        this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
        this.automaticCheckIn = this.fsp.autoCheckIn;
        this.enableNotifications = this.fsp.enableNotifications;
        this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
    }
    SettingsPage.prototype.ionViewDidLoad = function () {
        console.log('ionViewDidLoad SettingsPage');
        this.earlyCheckIn = this.fsp.earlyCheckInMinutes;
        this.automaticCheckIn = this.fsp.autoCheckIn;
        this.enableNotifications = this.fsp.enableNotifications;
        this.timeFromArrivalToCheckIn = this.fsp.timeFromArrivalToCheckIn;
    };
    SettingsPage.prototype.ionChanges = function () {
        this.fsp.earlyCheckInMinutes = this.earlyCheckIn;
        this.fsp.autoCheckIn = this.automaticCheckIn;
        this.fsp.enableNotifications = this.enableNotifications;
        this.fsp.timeFromArrivalToCheckIn = this.timeFromArrivalToCheckIn;
        if (this.number != "" && this.address != "") {
            this.getPolygon(this.address, this.number);
        }
        else if (this.address != "" && this.number == "") {
            this.getPolygon(this.address, this.fsp.number);
        }
        else if (this.address == "" && this.number != "") {
            this.getPolygon(this.fsp.address, this.number);
        }
        else {
            this.getPolygon(this.fsp.address, this.fsp.number);
        }
    };
    SettingsPage.prototype.toast = function (message, cssClass) {
        var toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            position: 'top',
            cssClass: cssClass
        });
        toast.present();
    };
    SettingsPage.prototype.getPolygon = function (adr, num) {
        var _this = this;
        var url = "https://nominatim.openstreetmap.org/search.php?q=";
        for (var x = 0; x < adr.split(" ").length; x++) {
            url = url + adr.split(" ")[x] + "+";
        }
        url = url + num + "&polygon_geojson=1&viewbox=&format=json";
        console.log("getPolygon");
        console.log(url);
        this.http.get(url).subscribe(function (data) {
            _this.setPolygon(data);
        });
    };
    SettingsPage.prototype.setPolygon = function (data) {
        var polygon = [];
        console.log("BOUND");
        this.addressDataFromAPI = data;
        if (data.length == 0) {
            this.toast('Fant ikke adresse', 'toast-failed');
        }
        else {
            polygon.push(data[0]["boundingbox"][0], data[0]["boundingbox"][2]);
            polygon.push(data[0]["boundingbox"][0], data[0]["boundingbox"][3]);
            polygon.push(data[0]["boundingbox"][1], data[0]["boundingbox"][2]);
            polygon.push(data[0]["boundingbox"][1], data[0]["boundingbox"][3]);
            polygon.push(data[0]["boundingbox"][0], data[0]["boundingbox"][2]);
            this.fsp.polygon = polygon;
            if (this.number != "" && this.address != "") {
                this.fsp.number = this.number;
                this.fsp.address = this.address;
            }
            else if (this.address != "" && this.number == "") {
                this.fsp.address = this.address;
            }
            else if (this.address == "" && this.number != "") {
                this.fsp.number = this.number;
            }
            else {
            }
            this.fsp.updateSettingsHandler(this.earlyCheckIn, this.automaticCheckIn, this.timeFromArrivalToCheckIn, this.fsp.address, this.fsp.number, this.fsp.enableNotifications);
            this.toast('Innstillinger endret', 'toast-success');
        }
    };
    SettingsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-settings',template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/pages/settings/settings.html"*/'<!--\n  Generated template for the SettingsPage page.\n\n  See http://ionicframework.com/docs/components/#navigation for more info on\n  Ionic pages and navigation.\n-->\n<ion-header>\n\n  <ion-navbar>\n    <ion-title>Innstillinger</ion-title>\n  </ion-navbar>\n\n</ion-header>\n\n\n<ion-content padding>\n\n  <ion-list style="padding:5px;margin:0">\n    <ion-item style="padding:0;border-bottom:5px solid #4D4D4D">\n      <ion-label style="padding-left:15px">Send varslinger</ion-label>\n      <ion-toggle [(ngModel)]="enableNotifications"></ion-toggle>\n    </ion-item>\n    <ion-item style="padding:0;border-bottom:5px solid #4D4D4D">\n      <ion-label style="padding-left:15px">Automatisk stempling</ion-label>\n      <ion-toggle [(ngModel)]="automaticCheckIn"></ion-toggle>\n    </ion-item>\n    <ion-item *ngIf="automaticCheckIn">\n    <ion-label>\n      <ion-label style="padding-top:5px;" >\n        Tid fra ankomst til stempling\n      </ion-label>\n    </ion-label>\n      <ion-range debounce="1000" min="0" max="60" step ="1" pin="true" [(ngModel)]="timeFromArrivalToCheckIn" color="secondary">\n        <ion-label range-left>0 min</ion-label>\n        <ion-label range-right>60 min</ion-label>\n      </ion-range>\n    </ion-item>\n  </ion-list>\n\n  <ion-list style="padding:5px;margin:0">\n    <ion-item>\n      <ion-label style="padding-top:5px;" color="primary" stacked><span style="font-weight: 900">Lagret adresse:</span> {{fsp.address}}</ion-label>\n      <ion-input [(ngModel)]="address" placeholder="Endre adresse ..."></ion-input>\n    </ion-item>\n    <ion-item>\n      <ion-label style="padding-top:5px" color="primary" stacked><span style="font-weight: 900">Lagret postnummer:</span> {{fsp.number}}</ion-label>\n      <ion-input type="number" [(ngModel)]="number" placeholder="Endre postnummer ..."></ion-input>\n    </ion-item>\n  </ion-list>\n\n  <ion-list style="padding:5px;margin:0">\n    <ion-item>\n    <ion-label style="padding-top:5px;" >\n      Tidlig innstempling \n    </ion-label>\n      <ion-range debounce="1000" min="0" max="120" step ="1" pin="true" [(ngModel)]="earlyCheckIn" color="secondary">\n        <ion-label range-left>0 min</ion-label>\n        <ion-label range-right>120 min</ion-label>\n      </ion-range>\n    </ion-item>\n  </ion-list>\n\n  <ion-footer no-shadow>\n	<ion-toolbar position="bottom">\n        <button (click)="ionChanges()" full ion-button>Lagre</button>\n	</ion-toolbar>\n</ion-footer>\n\n\n\n  \n\n</ion-content>\n'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/pages/settings/settings.html"*/,
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__providers_firebase_service_firebase_service__["a" /* FirebaseServiceProvider */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* ToastController */]])
    ], SettingsPage);
    return SettingsPage;
}());

//# sourceMappingURL=settings.js.map

/***/ }),

/***/ 140:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NotificationsProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_local_notifications__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(49);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




/*
  Generated class for the NotificationsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var NotificationsProvider = /** @class */ (function () {
    function NotificationsProvider(http, localNotifications, plt, alertCtrl) {
        this.http = http;
        this.localNotifications = localNotifications;
        this.plt = plt;
        this.alertCtrl = alertCtrl;
        this.plan = [];
        this.test = [];
        this.keys = [];
    }
    NotificationsProvider.prototype.sendNotification = function (type, timestamp) {
        var _this = this;
        this.http.get('../www/assets/data/notifications.json').subscribe(function (data) {
            _this.localNotifications.schedule({
                title: data[type]["title"],
                text: data[type]['text_pre'] + _this.fromTimestampToHHMM(timestamp) + data[type]['text_post']
            });
        });
    };
    NotificationsProvider.prototype.fromTimestampToHHMM = function (timestamp) {
        var date = new Date(timestamp);
        var m = Math.abs((new Date(date).getMinutes()));
        var h = Math.abs((new Date(date).getHours()));
        var outH = "" + h;
        var outM = "" + m;
        outH = (h < 10) ? "0" + h : outH;
        outM = (m < 10) ? "0" + m : outM;
        return (outH + ":" + outM);
    };
    NotificationsProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_local_notifications__["a" /* LocalNotifications */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["h" /* Platform */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["a" /* AlertController */]])
    ], NotificationsProvider);
    return NotificationsProvider;
}());

//# sourceMappingURL=notifications.js.map

/***/ }),

/***/ 244:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ContactPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_firebase_service_firebase_service__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__settings_settings__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_firebase_firestore__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_firebase_firestore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_firebase_firestore__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_angularfire2_firestore__ = __webpack_require__(217);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var ContactPage = /** @class */ (function () {
    function ContactPage(navCtrl, navParams, firebaseService, afd, toastCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.firebaseService = firebaseService;
        this.afd = afd;
        this.toastCtrl = toastCtrl;
        this.segmentWidth = [];
        this.toggleStempletider = false;
        this.segmentWidthPlan = [];
        this.lateWidth = "0%";
        this.totalWidthSoFar = 0;
        this.totalWidthSoFarPlan = 0;
        this.marginWidthTop = [];
        this.marginWidthBottom = [];
        this.stempletiderTop = [];
        this.stempletiderBottom = [];
        this.newStempletider = new Array(); //used for loading bar
        this.sendingStempletider = new Array(); //used for editing
        this.msg = "";
        this.timeStarts = '08:00';
        this.item = this.navParams.get('item');
        for (var x = 0; x < this.item.Stempletider.length; x++) {
            this.newStempletider.push(this.item.Stempletider[x]);
        }
        if (this.newStempletider[this.newStempletider.length - 1] != this.item.Slutt) {
            this.newStempletider.push(this.item.Slutt);
        }
        this.newStempletider.sort();
        this.sendingStempletider = this.item.Stempletider.sort();
        this.init();
        console.log(this.navCtrl.getActive().name);
    }
    ContactPage.prototype.init = function () {
        /* Adding the end time to the "Stempletider" array (making sure that it is not already added) */
        /* Calculate the duration of the work session, measured in seconds */
        this.seconds = ((new Date(this.newStempletider[this.newStempletider.length - 1])).getTime() / 1000 - (new Date(this.item.Start)).getTime() / 1000);
        /* Setting the lateWidth variable if check in was done too late */
        if (100 * (Math.abs((+new Date(this.newStempletider[0]) - +new Date(this.item.Start)) / 1000) / this.seconds) > 0) {
            this.lateWidth = (100 * (Math.abs((+new Date(this.newStempletider[0]) - +new Date(this.item.Start)) / 1000) / this.seconds)) + "%";
        }
        /* Calculate the segment widths of the loading bar */
        this.totalWidthSoFar = parseFloat(this.lateWidth.slice(0, -1));
        for (var x = 0; x < this.newStempletider.length - 1; x++) {
            var temp = Math.min(100 - this.totalWidthSoFar, 100 * (Math.abs((+new Date(this.newStempletider[x + 1]) - +new Date(this.newStempletider[x])) / 1000) / this.seconds));
            this.totalWidthSoFar += temp;
            this.segmentWidth.push(temp + "%");
        }
    };
    ContactPage.prototype.timestampToDate2 = function (timestamp) {
        timestamp = new Date(timestamp);
        var months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
        var d = timestamp.getDate();
        var outD = (d < 10) ? "0" + d : d;
        return (outD + ". " + months[timestamp.getMonth()] + " " + timestamp.getFullYear());
    };
    ContactPage.prototype.fromTimestampToHHMM2 = function (timestamp) {
        var date = new Date(timestamp);
        var m = Math.abs((new Date(date).getMinutes()));
        var h = Math.abs((new Date(date).getHours()));
        var outH = "" + h;
        var outM = "" + m;
        outH = (h < 10) ? "0" + h : outH;
        outM = (m < 10) ? "0" + m : outM;
        return (outH + ":" + outM);
    };
    ContactPage.prototype.fromTimestampToHHMM = function (timestamp) {
        var date = new Date(timestamp);
        var m = Math.abs((new Date(date).getMinutes()));
        var h = Math.abs((new Date(date).getHours()));
        var outH = "" + h;
        var outM = "" + m;
        outH = (h < 10) ? "0" + h : outH;
        outM = (m < 10) ? "0" + m : outM;
        return (outH + ":" + outM);
    };
    ContactPage.prototype.inTheFuture = function () {
        var currentDate = new Date();
        var startDate = new Date(this.item.Start);
        return (startDate.getTime() > currentDate.getTime());
    };
    ContactPage.prototype.alreadyInList = function (d) {
        for (var x = 0; x < this.sendingStempletider.length; x++) {
            if (new Date(this.sendingStempletider[x]).getMinutes() == d.getMinutes() && new Date(this.sendingStempletider[x]).getHours() == d.getHours()) {
                return true;
            }
        }
        return false;
    };
    ContactPage.prototype.editTimestamps = function () {
        //this.toggleStempletider = true;
        //this.newStempletider = this.item.Stempletider;
    };
    ContactPage.prototype.deleteTimestamp = function (x) {
        this.sendingStempletider.splice(x, 1);
    };
    ContactPage.prototype.addTimestamp = function (timestamp) {
        var d = new Date(this.item.Start);
        var h = this.timeStarts.slice(0, 2);
        var m = this.timeStarts.slice(3, 5);
        d.setUTCHours(parseInt(h) - 2);
        d.setUTCMinutes(parseInt(m));
        if (!this.alreadyInList(d)) {
            this.sendingStempletider.push(d);
            this.sendingStempletider.sort();
        }
        else {
            this.toast('FEIL: Allerede lagt til stempling på dette tidspunktet', 3000, "toast-failed");
        }
    };
    ContactPage.prototype.sortStempletider = function () {
        for (var y = 0; y < this.newStempletider.length; y++) {
            for (var x = 0; x < this.newStempletider.length - 1; x++) {
                if (new Date(this.newStempletider[x]).getTime() > new Date(this.newStempletider[x + 1]).getTime()) {
                    var temp = this.newStempletider[x];
                    this.newStempletider[x] = this.newStempletider[x + 1];
                    this.newStempletider[x + 1] = temp;
                }
            }
        }
    };
    ContactPage.prototype.toast = function (text, duration, css) {
        var toast = this.toastCtrl.create({
            message: text,
            duration: duration,
            position: 'top',
            cssClass: css
        });
        toast.present();
    };
    ContactPage.prototype.sendChangesHandler = function () {
        if (this.sendChanges()) {
            console.log("RETURNERTE TRUE");
            this.toast('Endringer sendt til godkjenning', 3000, "toast-success");
        }
    };
    ContactPage.prototype.sendChanges = function () {
        /* Error handling */
        console.log("SEND CHANGES");
        console.log(this.sendingStempletider);
        if (this.msg == "") {
            this.toast('FEIL: Beskriv årsak til endring', 3000, "toast-failed");
        }
        if (this.sendingStempletider.length % 2 != 0) {
            this.toast('FEIL: Det må være like mange inn- og utstemplinger', 5000, "toast-failed");
        }
        /* Creating an array consisting of old and new change messages */
        var listEndretMelding = [];
        if (this.item.EndretMelding.length > 0) {
            for (var i = 0; i < this.item.EndretMelding.length; i++) {
                listEndretMelding.push(this.item.EndretMelding[i]);
            }
            listEndretMelding.push(this.msg);
        }
        else {
            listEndretMelding.push(this.msg);
        }
        console.log("KOM HIT");
        /* Sending */
        if (this.msg != "" && this.sendingStempletider.length % 2 == 0) {
            return this.afd.collection("arbeidsokter").doc(this.item.ID).update({
                "Stempletider": this.sendingStempletider,
                "EndretMelding": listEndretMelding
            })
                .then(function () {
                return true;
            })
                .catch(function (error) {
                console.error("Error when editing CheckInOut: ", error);
                return false;
            });
        }
    };
    ContactPage.prototype.selectBackground = function (i) {
        if (i % 2 == 0) {
            return "repeating-linear-gradient(-45deg,#7CFC00,#7CFC00 10px,#4EFC00 10px,#4EFC00 20px)";
        }
        else {
            return "repeating-linear-gradient(-45deg,#a00b0b,#a00b0b 10px,#c00b0b 10px,#c00b0b 20px)";
        }
    };
    ContactPage.prototype.toggleStemple = function () {
        if (this.toggleStempletider) {
            this.toggleStempletider = false;
        }
        else {
            this.toggleStempletider = true;
        }
    };
    ContactPage.prototype.selectSettings = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_3__settings_settings__["a" /* SettingsPage */], {});
    };
    ContactPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-contact',template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/pages/contact/contact.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title>\n      Detaljer\n    </ion-title>\n\n    <ion-buttons end>\n      <button ion-button icon-only (click)="selectSettings()">\n        <ion-icon name="settings"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content>\n  <h1 style="color:black; text-align:center;padding-top:20px">{{timestampToDate2(item.Start)}}</h1>\n  <h3 style="color:black; text-align:center;padding:0">{{fromTimestampToHHMM2(item.Start)}} - {{fromTimestampToHHMM2(item.Slutt)}}</h3>\n  \n <ion-card class="ionCard" *ngIf="!inTheFuture()"> \n    <ion-card-header class="ionCardHeader">Stempletider<ion-icon style="float: right;" name="build" (click)="toggleStemple()"></ion-icon></ion-card-header>\n    \n    <div *ngIf="!toggleStempletider" style="width:75%;margin-left:auto;margin-right:auto;margin-top:5px;height:40px">\n      <div *ngIf="item.Stempletider.length==1" style="float:left; color:black; text-align:center"> <h5>Stemplet inn: <br> <span style="font-weight:300">–</span></h5></div>\n      <div *ngIf="item.Stempletider.length!=1" style="float:left; color:black; text-align:center"> <h5>Stemplet inn: <br> <span style="font-weight:300">{{fromTimestampToHHMM(item.Stempletider[0])}} </span></h5></div>\n      <div *ngIf="item.Stempletider.length==1" style="float:right; color:black; text-align:center"> <h5>Stemplet ut: <br>  <span style="font-weight:300">–</span> </h5></div>\n      <div *ngIf="item.Stempletider.length!=1" style="float:right; color:black; text-align:center"> <h5>Stemplet ut: <br>  <span style="font-weight:300">{{fromTimestampToHHMM(item.Stempletider[item.Stempletider.length -1 ])}} </span> </h5></div>\n    </div>\n\n    <div *ngIf="!toggleStempletider" class="loadingBox" style="height:10px" >\n        <div class="loadingBoxInner" *ngIf="lateWidth!=\'0%\'" style="width:0px;margin-left:-4px">\n          <div style="height:10px;width:100%" ></div>\n        </div>\n        <div *ngIf="lateWidth!=\'0%\'" style="height:10px; margin-right:-4px" class="loadingBoxInner" [ngStyle]="{\'width\' : lateWidth}" >\n          <div style="height:10px;width:100%" ></div>\n        </div>\n        <div style="margin-top:-40px; height:10px" *ngFor="let x of segmentWidth, let j = index" class="loadingBoxInner" [ngStyle]="{\'width\' : x}">\n          <div style="height:10px;width:100%;margin-top:-40px"></div>\n        </div>\n        <div class="loadingBoxInner">\n        </div>\n    </div>\n\n    <ion-list style="border-radius:0" *ngIf="toggleStempletider" inset style="margin:0;padding:0">\n      <ion-item style="padding:0;height:30px" *ngFor="let x of sendingStempletider, let j = index">\n        <div class="checkInOutInfoBox" style="display:table-cell; width:30px;padding-top:20px;padding-bottom:20px" [ngStyle]="{\'background\' : selectBackground(j)}">\n          <h2 *ngIf="j%2==0" style="text-transform:uppercase; text-align:center; font-size: 20px; font-weight:200;padding:5px">INN</h2>\n          <h2 *ngIf="j%2!=0" style="color:white; text-transform:uppercase; text-align:center; font-size: 20px; font-weight:200;padding:8.5px">UT</h2>\n        </div>          \n        <div style="display:table-cell;padding:15px;vertical-align:middle"> {{fromTimestampToHHMM(x)}}</div>\n        <ion-icon class="trashIcon" (click)="deleteTimestamp(j)" name="trash" item-end></ion-icon>\n      </ion-item>\n      <button ion-button full outline style="border-top:0;background-color: #f8f8f8" (click)="picker.open()">\n        <ion-datetime #picker cancelText="tilbake" doneText="ferdig" pickerFormat="HH:mm" [(ngModel)]="timeStarts" (ionChange)="addTimestamp()"></ion-datetime>\n        <ion-icon style="font-size: 30px;" name="add-circle"></ion-icon>\n      </button>\n     \n      <ion-item>\n        <ion-label stacked style="padding:5px">Årsak til endring: </ion-label>\n        <ion-textarea style="padding:5px" [(ngModel)]="msg"></ion-textarea>\n      </ion-item>\n      <button ion-button full (click)="sendChangesHandler()">Lagre endringer</button>\n    </ion-list> \n  </ion-card>\n\n<ion-card class="ionCard" >\n  <ion-card-header class="ionCardHeader">På jobb denne dagen</ion-card-header>\n  <ion-list style="padding:0">\n    <ion-item>\n      <ion-avatar item-start>\n        <div class="avatar">KÅ</div>\n      </ion-avatar>\n      <h2>Karianne Åsen</h2>\n      <p>10:00 - 18:00</p>\n    </ion-item>\n\n    <ion-item>\n      <ion-avatar item-start>\n        <div class="avatar">KS</div>\n      </ion-avatar>\n      <h2>Karl Svendsen</h2>\n      <p>08:00 - 16:00</p>\n    </ion-item>\n\n    <ion-item>\n      <ion-avatar item-start>\n        <div class="avatar">KS</div>\n      </ion-avatar>\n      <h2>Karl Stiggerud</h2>\n      <p>08:00 - 16:00</p>\n    </ion-item>\n\n    <ion-item>\n      <ion-avatar item-start>\n        <div class="avatar">JM</div>\n      </ion-avatar>\n      <h2>Johanna Mølbakken</h2>\n      <p>10:00 - 18:00</p>\n    </ion-item>\n  </ion-list>\n</ion-card>\n</ion-content>\n'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/pages/contact/contact.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_2__providers_firebase_service_firebase_service__["a" /* FirebaseServiceProvider */], __WEBPACK_IMPORTED_MODULE_5_angularfire2_firestore__["a" /* AngularFirestore */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["i" /* ToastController */]])
    ], ContactPage);
    return ContactPage;
}());

//# sourceMappingURL=contact.js.map

/***/ }),

/***/ 288:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 288;

/***/ }),

/***/ 332:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"../pages/settings/settings.module": [
		1013,
		1
	],
	"../pages/test/test.module": [
		1014,
		0
	]
};
function webpackAsyncContext(req) {
	var ids = map[req];
	if(!ids)
		return Promise.reject(new Error("Cannot find module '" + req + "'."));
	return __webpack_require__.e(ids[1]).then(function() {
		return __webpack_require__(ids[0]);
	});
};
webpackAsyncContext.keys = function webpackAsyncContextKeys() {
	return Object.keys(map);
};
webpackAsyncContext.id = 332;
module.exports = webpackAsyncContext;

/***/ }),

/***/ 400:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TabsPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__about_about__ = __webpack_require__(401);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__contact_contact__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__home_home__ = __webpack_require__(402);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var TabsPage = /** @class */ (function () {
    function TabsPage() {
        this.tab1Root = __WEBPACK_IMPORTED_MODULE_3__home_home__["a" /* HomePage */];
        this.tab2Root = __WEBPACK_IMPORTED_MODULE_1__about_about__["a" /* AboutPage */];
        this.tab3Root = __WEBPACK_IMPORTED_MODULE_2__contact_contact__["a" /* ContactPage */];
    }
    TabsPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/pages/tabs/tabs.html"*/'<ion-tabs>\n  <ion-tab [root]="tab1Root" tabTitle="Min arbeidsplan" tabIcon="home"></ion-tab>\n  <ion-tab [root]="tab2Root" tabTitle="Statistikk" tabIcon="stats"></ion-tab>\n</ion-tabs>\n'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/pages/tabs/tabs.html"*/
        }),
        __metadata("design:paramtypes", [])
    ], TabsPage);
    return TabsPage;
}());

//# sourceMappingURL=tabs.js.map

/***/ }),

/***/ 401:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AboutPage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__settings_settings__ = __webpack_require__(118);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AboutPage = /** @class */ (function () {
    function AboutPage(navCtrl) {
        this.navCtrl = navCtrl;
        this.toggle1 = false;
        this.toggle2 = false;
    }
    AboutPage.prototype.toggle = function () {
        if (this.toggle1) {
            this.toggle1 = false;
        }
        else {
            this.toggle1 = true;
        }
    };
    AboutPage.prototype.toggle21 = function () {
        if (this.toggle2) {
            this.toggle2 = false;
        }
        else {
            this.toggle2 = true;
        }
    };
    AboutPage.prototype.selectSettings = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_2__settings_settings__["a" /* SettingsPage */], {});
    };
    AboutPage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-about',template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/pages/about/about.html"*/'<ion-header>\n\n  <ion-navbar>\n    <ion-title>\n      Statistikk\n    </ion-title>\n\n    <ion-buttons end>\n      <button ion-button icon-only (click)="selectSettings()">\n        <ion-icon name="settings"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n\n</ion-header>\n\n<ion-content padding>\n  <ion-card class="flexitid">\n    Tilgjengelig flexitid: 24,4 timer\n  </ion-card>\n\n\n  <ion-card class="ionCard" >\n  <ion-card-header class="ionCardHeader">21. juni - \n    <ion-icon  class="documentIcon" name="document"></ion-icon>\n  </ion-card-header>\n  <ion-grid>\n    <ion-row>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            Ordinært:\n          </ion-item>\n          <ion-item>\n            Overtid:\n          </ion-item>\n          <ion-item class="finalSum">\n            Sum\n          </ion-item>\n        </ion-list>\n      </ion-col>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            24,6 timer\n          </ion-item>\n          <ion-item>\n            10,2 timer\n          </ion-item>\n          <ion-item class="finalSum">\n          34,8 timer\n          </ion-item>\n        </ion-list>\n      </ion-col>\n    </ion-row>\n    <ion-row>\n      <ion-col>\n        <ion-item class="sum">\n          Opptjent: 10.203,-\n        </ion-item>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n  </ion-card>\n\n  <ion-card class="ionCard" >\n  <ion-card-header (click)="toggle()" class="ionCardHeader">21. mai - 20. juni\n    <ion-icon class="documentIcon" name="document"></ion-icon>\n  </ion-card-header>\n  <ion-grid *ngIf="toggle1">\n    <ion-row>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            Ordinært:\n          </ion-item>\n          <ion-item>\n            Overtid:\n          </ion-item>\n          <ion-item class="finalSum">\n            Sum\n          </ion-item>\n        </ion-list>\n      </ion-col>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            24,6 timer\n          </ion-item>\n          <ion-item>\n            10,2 timer\n          </ion-item>\n          <ion-item class="finalSum">\n          34,8 timer\n          </ion-item>\n        </ion-list>\n      </ion-col>\n    </ion-row>\n    <ion-row>\n      <ion-col>\n        <ion-item class="sum">\n          Opptjent: 10.203,-\n        </ion-item>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n  </ion-card>\n\n  <ion-card class="ionCard" >\n  <ion-card-header (click)="toggle21()" class="ionCardHeader">21. april - 20. mai\n    <ion-icon class="documentIcon" name="document"></ion-icon>\n  </ion-card-header>\n  <ion-grid *ngIf="toggle2">\n    <ion-row>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            Ordinært:\n          </ion-item>\n          <ion-item>\n            Overtid:\n          </ion-item>\n          <ion-item class="finalSum">\n            Sum\n          </ion-item>\n        </ion-list>\n      </ion-col>\n      <ion-col>\n        <ion-list style="padding:0">\n          <ion-item>\n            24,6 timer\n          </ion-item>\n          <ion-item>\n            10,2 timer\n          </ion-item>\n          <ion-item class="finalSum">\n          34,8 timer\n          </ion-item>\n        </ion-list>\n      </ion-col>\n    </ion-row>\n    <ion-row>\n      <ion-col>\n        <ion-item class="sum">\n          Opptjent: 10.203,-\n        </ion-item>\n      </ion-col>\n    </ion-row>\n  </ion-grid>\n  </ion-card>\n\n  \n</ion-content>>\n'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/pages/about/about.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]])
    ], AboutPage);
    return AboutPage;
}());

//# sourceMappingURL=about.js.map

/***/ }),

/***/ 402:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__providers_location_tracker_location_tracker__ = __webpack_require__(403);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_common_http__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Rx__ = __webpack_require__(747);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Rx___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_Rx__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__contact_contact__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__settings_settings__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__providers_firebase_service_firebase_service__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__providers_notifications_notifications__ = __webpack_require__(140);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






//testing -->




var HomePage = /** @class */ (function () {
    //CONSTRUCTOR
    function HomePage(navCtrl, locationTracker, http, fsp, notifications) {
        this.navCtrl = navCtrl;
        this.locationTracker = locationTracker;
        this.http = http;
        this.fsp = fsp;
        this.notifications = notifications;
        this.checkedIn = false;
        this.checkInTime = null;
        this.waitingToCheckIn = false;
        this.withinRange = false;
        //Variables used to change the text and color of the "stemple inn"-button.
        this.stempleButton = "Stemple inn";
        this.checkInOutVar = "checkInOut";
        this.doneOnce = false;
        this.paJobb = false;
        this.forlotTid = null;
        //Defining the default value of segment
        this.planner = "kommende";
        //The first value is always the initial checkInTime, and the last is the final checkOutTime.
        this.checkInOutTimes = [];
        //Used to calculate the loadingBar.
        this.segmentWidth = []; //Width of all segments, except the last
        this.currentWidth = "0%"; //Width of the last segment
        this.totalWidthSoFar = 0; //The sum of all entries in the segmentWidth array
        this.initialCheckIn = false; //Indicate whether the employee has made an initial check in
        this.latePercentage = "0%"; //How many percent of the total work day was the employee late. 
        this.lateCheckIn = false; //Whether or not the employee checked in late
        this.stop = false; //Indicates whether the loading bar is running.
        this.finishedBreak = false;
        this.initialLocationSet = false;
        this.initialFirebase = false;
        //Variables meant to be changed by the admin user
        this.numberOfHoursRegardedAsNew = 72; //For how many hours are records marked as "new"? 
        this.earlyCheckInHours = 0.25; //How many hour before scheduled start up are employees allowed to check in?
        this.numberOfSecondsFromOnLocationToCheckIn = 10;
        this.activateAutomaticCheckInOut = true;
        this.enableNotifications = true;
        this.start();
        //this.setInitialLoadingBar();
    }
    HomePage.prototype.start = function () {
        var _this = this;
        __WEBPACK_IMPORTED_MODULE_5_rxjs_Rx__["Observable"].interval(1000).subscribe(function (ref) { return _this.continueslyChecked(); });
    };
    HomePage.prototype.continueslyChecked = function () {
        console.log("LATECHECKIN2");
        console.log(this.lateCheckIn);
        if (!this.initialLocationSet) {
            this.locationTracker.startTracking(); //Start tracking location
            this.initialLocationSet = true;
        }
        this.paJobb = this.locationTracker.paJobb;
        /* Starter på nytt om man ikke klarer å lese fra databasen*/
        if (this.fsp.planNext[0] == undefined) {
            return;
        }
        this.fsp.getCheckedIn();
        //console.log('status på checkedIn', this.checkedIn);
        this.checkedIn = this.fsp.checkedIn;
        console.log('status på activateAutomaticCheckInOut', this.activateAutomaticCheckInOut);
        console.log('status på autoCheckIn', this.fsp.autoCheckIn);
        if (this.checkedIn) {
            this.stempleButton = 'Stemple ut';
            this.checkInOutVar = "checkInOut2";
        }
        else if (!this.checkedIn) {
            this.stempleButton = 'Stemple inn';
            this.checkInOutVar = 'checkInOut';
        }
        //this.checkedIn = this.fsp.planNext[0]["checkedIn"];
        /* Set the duration of the work session in seconds */
        this.seconds = ((new Date(this.fsp.planNext[0]["Slutt"])).getTime() / 1000 - (new Date(this.fsp.planNext[0]["Start"])).getTime() / 1000); //Number of seconds
        if (!this.initialFirebase) {
            console.log("SET INITIAL LOADING BAR");
            this.setInitialLoadingBar();
            this.initialFirebase = true;
        }
        var currentDate = new Date();
        var startDate = new Date(this.fsp.planNext[0]["Start"]);
        var endDate = new Date(this.fsp.planNext[0]['Slutt']);
        this.activateAutomaticCheckInOut = this.fsp.autoCheckIn;
        this.enableNotifications = this.fsp.enableNotifications;
        /* Automatic Check-in */
        var now = new Date();
        if (this.paJobb && this.fsp.isWorking(now) && !this.checkedIn && !this.waitingToCheckIn && this.activateAutomaticCheckInOut) {
            this.fsp.writeArrivalTime(now);
            this.checkInTime = new Date(this.fsp.decideCheckInTime(now));
            console.log(this.checkInTime);
            this.waitingToCheckIn = true;
            console.log('time to check in');
        }
        else if (this.checkInTime != null && this.waitingToCheckIn && new Date().getTime() > this.checkInTime.getTime() && !this.checkedIn && this.activateAutomaticCheckInOut) {
            this.checkInOut(this.checkInTime);
            this.waitingToCheckIn = false;
        }
        /* Updating the loadingBar */
        if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == false) {
            //If too late, and not checked in.
            if (this.currentWidth == "0%") {
                this.updateLoadingBarLate();
                this.lateCheckIn = true;
            }
            else {
                console.log("LATECHECKIN1");
                console.log(this.lateCheckIn);
            }
        }
        else if (currentDate.getTime() - startDate.getTime() >= 0 && this.initialCheckIn == true && this.stop == false) {
            //If already checked in.
            this.updateLoadingBar();
        }
        else {
            //If not not too late, and not checked in
        }
        //Logic for checking if you leave work 
        this.checkLeave(endDate);
    };
    HomePage.prototype.manuallyCheckInOut = function () {
        this.activateAutomaticCheckInOut = false;
        this.fsp.updateAutomaticSetting(false);
        this.checkInOut(new Date());
    };
    HomePage.prototype.checkInOut = function (checkInTime) {
        /* Updating the LoadingBar with a red color corresponding to late check in time. */
        if (this.lateCheckIn == true && this.segmentWidth.length == 0 && this.stop == false) {
            this.segmentWidth.push(this.currentWidth);
            this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0, -1));
            this.latePercentage = this.currentWidth;
            this.currentWidth = "0%";
        }
        this.initialCheckIn = true; //set that we have done an initial CheckIn
        this.checkInOutTimes.push(new Date(checkInTime)); //register the checkInTime
        //this.fsp.addCheckInOutTime(new Date());
        if (this.checkInOutTimes.length > 1 && parseFloat(this.currentWidth.slice(0, -1)) + this.totalWidthSoFar < 100 && this.stop == false) {
            this.segmentWidth.push(this.currentWidth);
            this.totalWidthSoFar += parseFloat(this.currentWidth.slice(0, -1));
            this.currentWidth = "0%"; //Making sure that the new loadingBar starts at 0%
        }
        /* Changing the text of the "Stemple inn/ut" box, changing the color of the pin. */
        if (this.stempleButton == "Stemple inn") {
            this.stempleButton = "Stemple ut";
            this.checkInOutVar = "checkInOut2";
            this.checkedIn = true;
            this.fsp.writeCheckedIn(this.checkedIn);
        }
        else {
            this.stempleButton = "Stemple inn";
            this.checkInOutVar = "checkInOut";
            this.checkedIn = false;
            this.fsp.writeCheckedIn(this.checkedIn);
        }
    };
    HomePage.prototype.calculateTimePeriodMinutes = function (time1, time2) {
        if (this.checkInOutTimes.length > 1) {
            var m = Math.abs((new Date(time2).getMinutes() - new Date(time1).getMinutes()));
            var h = Math.abs((new Date(time2).getHours() - new Date(time1).getHours()));
            var outM = h * 60 * 60 + m * 60;
            return outM;
        }
    };
    //LOADING BAR
    HomePage.prototype.updateLoadingBar = function () {
        //Adding the first segment if employee has checked in late
        if (this.lateCheckIn == true && this.segmentWidth.length == 0) {
            this.segmentWidth.push(this.currentWidth);
        }
        var currentDate = new Date();
        var startDate = new Date(this.fsp.planNext[0]["Start"]);
        //Setting the width of the current segment
        this.currentWidth = Math.min(100 - this.totalWidthSoFar, 100 * (Math.abs((+currentDate - +this.checkInOutTimes[this.checkInOutTimes.length - 1]) / 1000) / this.seconds)) + "%";
        //Stopping loading bar when it has been filled.
        if (this.currentWidth == 100 - this.totalWidthSoFar + "%" && this.stop == false) {
            this.segmentWidth.push(this.currentWidth);
            this.stop = true; //Making sure that no additional segments are added to the loading bar.
            this.currentWidth = "0%";
        }
    };
    HomePage.prototype.updateLoadingBarLate = function () {
        var currentDate = new Date();
        var startDate = new Date(this.fsp.planNext[0]["Start"]);
        var width = 100 * (Math.abs((+currentDate - +startDate) / 1000) / this.seconds);
        if (width < 100) {
            this.currentWidth = Math.min(100 - this.totalWidthSoFar, width) + "%";
        }
        else {
            this.currentWidth = "100%";
        }
    };
    /* Sets the segments of the initial loading bar based on check in/out times stored in Firebase*/
    HomePage.prototype.setInitialLoadingBar = function () {
        var stempletider = this.fsp.planNext[0]["Stempletider"];
        this.totalWidthSoFar = 0;
        var segmentWidth = [];
        for (var x = 1; x < stempletider.length; x++) {
            var date1 = new Date(stempletider[x]);
            var date0 = new Date(stempletider[x - 1]);
            var temp = 100 * (Math.abs((+date1 - +date0) / 1000) / this.seconds);
            segmentWidth.push(Math.min(100 - this.totalWidthSoFar, temp) + "%");
            this.totalWidthSoFar += parseFloat(segmentWidth[x - 1].slice(0, -1));
        }
        this.segmentWidth = segmentWidth;
        var currentDate = new Date();
        var temp = 100 * (Math.abs((+new Date(stempletider[stempletider.length - 1]) - +currentDate) / 1000) / this.seconds);
        this.currentWidth = Math.min(100 - this.totalWidthSoFar, temp) + "%";
        if (+new Date(stempletider[0]) - +new Date(this.fsp.planNext[0]["Start"]) > 0) {
            this.lateCheckIn = true;
        }
    };
    /* STYLING */
    // Used to determine whether a rec is markered with a ribbon
    HomePage.prototype.checkIfNew = function (addedDate) {
        var addedDating = new Date(addedDate).getTime();
        var today = new Date().getTime();
        if ((today - addedDating) / (3600 * 1000) > this.numberOfHoursRegardedAsNew) {
            return false;
        }
        return true;
    };
    // Write "i dag" or "i morgen" in the upper box if the next work session is today or tomorrow
    HomePage.prototype.fromTimestampToTextIdagImorgen = function (dato, timestamp) {
        var today = new Date();
        var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        if (new Date(timestamp).setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)) {
            return "I dag";
        }
        else if (new Date(timestamp).setHours(0, 0, 0, 0) == tomorrow.setHours(0, 0, 0, 0)) {
            return "I morgen";
        }
        else {
            return dato;
        }
    };
    HomePage.prototype.correctTime = function (timeStamp) {
        var workDate = new Date(timeStamp);
        var currentDate = new Date();
        if (workDate.getMonth() == currentDate.getMonth() && workDate.getDate() == currentDate.getDate() && workDate.getHours() - currentDate.getHours() < this.earlyCheckInHours || currentDate.getDate() - workDate.getDate() > 0) {
            return true;
        }
        return false;
    };
    // Returning the name of the weekday from a timestamp
    HomePage.prototype.getWeekdayName = function (timestamp) {
        var d = new Date(timestamp);
        var weekday = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        return weekday[d.getDay()];
    };
    // Called when the used click on one of the work sessions in order to open the detailed page
    HomePage.prototype.itemSelected = function (item, segmentWidth) {
        console.log(item);
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_6__contact_contact__["a" /* ContactPage */], {
            item: item,
            segmentwidth: segmentWidth
        });
    };
    HomePage.prototype.checkLeave = function (endDate) {
        if (this.locationTracker != undefined) {
            this.paJobb = this.locationTracker.paJobb;
        }
        //Må hente ut når man slutter for dagen og sjekke om man går for tidlig. Gir da en notifikasjon på når man slutter og at man kan melde sykdom i appen. 
        //Sjekker om man går fra jobb før man er ferdig
        var now = new Date();
        var bufferTime = now.getTime() + 600000;
        if (bufferTime < endDate.getTime() && this.paJobb == false && this.forlotTid == null && this.checkedIn) {
            this.forlotTid = now;
        }
        else if (this.forlotTid == null) {
            return;
        }
        else if (now.getTime() - this.forlotTid.getTime() > 5000 && bufferTime < endDate.getTime() && this.paJobb == false && this.checkedIn && !this.doneOnce && this.enableNotifications) {
            this.notifications.sendNotification('leftEarly', endDate);
            this.doneOnce = true;
        }
        else if (this.paJobb == true) {
            this.doneOnce = false;
            this.forlotTid = null;
        }
        else if (now.getTime() - this.forlotTid.getTime() > 60000 && this.checkedIn && this.paJobb == false) {
            this.checkInOut(this.forlotTid);
        }
        else if (now.getTime() >= endDate.getTime() && this.paJobb == false && this.checkedIn && this.forlotTid != null && this.enableNotifications) {
            this.notifications.sendNotification('check_out', this.forlotTid);
        }
    };
    HomePage.prototype.timestampToDate = function (timestamp) {
        timestamp = new Date(timestamp);
        var months = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
        var d = timestamp.getDate();
        var outD = (d < 10) ? "0" + d : d;
        return (outD + " " + months[timestamp.getMonth()] + " " + timestamp.getFullYear());
    };
    HomePage.prototype.fromTimestampToHHMM = function (timestamp) {
        var date = new Date(timestamp);
        var m = Math.abs((new Date(date).getMinutes()));
        var h = Math.abs((new Date(date).getHours()));
        var outH = "" + h;
        var outM = "" + m;
        outH = (h < 10) ? "0" + h : outH;
        outM = (m < 10) ? "0" + m : outM;
        return (outH + ":" + outM);
    };
    HomePage.prototype.selectSettings = function () {
        this.navCtrl.push(__WEBPACK_IMPORTED_MODULE_7__settings_settings__["a" /* SettingsPage */], {});
    };
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar>\n    <ion-title>\n      Min arbeidsplan\n    </ion-title>\n    <ion-buttons end>\n      <button ion-button icon-only (click)="selectSettings()">\n        <ion-icon name="settings"></ion-icon>\n      </button>\n    </ion-buttons>\n  </ion-navbar>\n</ion-header>\n \n\n<ion-content>\n<div class="info">\n\n<!-- Next record, checking in/out -->\n\n<ion-slides>\n  <ion-slide>\n  <div class="record" *ngFor="let x of fsp.planNext, let i=index" >\n    <div class="topBox" (click)="itemSelected(fsp.planNext[0],segmentWidth)">\n      <ion-icon name="pin" class="pinIcon" [ngStyle]="{\'color\': (locationTracker.paJobb ? \'#7CFC00\' : \'#a00b0b\')}"></ion-icon>      \n      <h1>{{ fromTimestampToTextIdagImorgen(timestampToDate(fsp.planNext[i][\'Start\']),fsp.planNext[i][\'Start\']) }} </h1>\n      <h3>{{fromTimestampToHHMM(fsp.planNext[i]["Start"])}} - {{fromTimestampToHHMM(fsp.planNext[i]["Slutt"])}}</h3>\n    </div>\n    <div class="infoField">\n      <div *ngIf="lateCheckIn" class="loadingBar" style="width:0;margin-right:-4px;margin-left:-4px"></div>\n      <div *ngFor="let x of segmentWidth" class="loadingBar" [ngStyle]="{\'width\' : x}"></div>\n      <div class="loadingBar" id="currentlyLoading" [ngStyle] = "{\'width\' : currentWidth}"></div>\n    </div>\n    <button [disabled]="((!locationTracker.paJobb && !fsp.checkedIn) || !correctTime(fsp.planNext[i][\'Start\']))" ion-button full primary class="{{checkInOutVar}} button button-md button-default button-default-md button-full button-full-md" (click)="manuallyCheckInOut()">{{stempleButton}}</button>\n  </div>\n  </ion-slide>\n  <ion-slide>\n  <div class="record">\n    <div class="topBox">\n      <h1>Ekstraregistrering</h1>\n      <h3>Uten dato/GPS</h3>\n    </div>\n    <div class="infoField">\n    </div>\n    <button ion-button full primary class="{{checkInOutVar}} button button-md button-default button-default-md button-full button-full-md" (click)="manuallyCheckInOut()">{{stempleButton}}</button>\n  </div>\n  </ion-slide>\n</ion-slides>\n\n<div *ngIf="!fsp.doneInitial" style="text-align:center">\n  <ion-spinner icon="bubbles"></ion-spinner>\n</div>\n\n<!-- Segment buttons-->\n<div *ngIf="fsp.doneInitial" class="records">\n  <div style="background-color: rgb(242, 242, 242); border-radius: 5px 5px 0px 0px; margin-bottom: -25px;">\n  <ion-segment [(ngModel)]="planner">\n    <ion-segment-button value="kommende">\n      Kommende\n    </ion-segment-button>\n    <ion-segment-button value="ledig">\n      Ledig\n    </ion-segment-button>\n    <ion-segment-button value="fullfort">\n      Fullført\n    </ion-segment-button>\n  </ion-segment>\n</div>\n\n<!-- Future records -->\n<ion-list style="background-color: rgb(242, 242, 242); border-radius: 0px 0px 5px 5px">\n\n  <div [ngSwitch]="planner" >\n\n    <!-- Upcoming -->\n    <div *ngFor="let x of fsp.uniqueWeeknumbers, let j=index">\n    \n    <h1 style="padding-top: 10px; padding-left: 0px; color:black; font-size: 17px;" *ngSwitchCase="\'kommende\'" >{{fsp.uniqueWeeknumbers[j]}}</h1>\n\n    <ion-item-sliding *ngFor="let x of fsp.upcoming2[j], let i=index">\n      <ion-item *ngSwitchCase="\'kommende\'" (click)="itemSelected(x)" >\n          <div *ngIf="checkIfNew([fsp.upcoming2[j][i][\'Added\']])" class="ribbon">\n              <span>Ny vakt</span>\n          </div>\n          <div class="futureDate">\n            <span style="font-size: 25px; font-weight: 900; color:#ffffff">{{timestampToDate(fsp.upcoming2[j][i]["Start"]) | slice:0:2}}</span><br>\n            <span style="font-size: 21px; font-weight: 300; margin-top:0.5px;color:#ffffff">{{timestampToDate(fsp.upcoming2[j][i]["Start"]) | slice:3:6}}</span> \n          </div>\n          <div class="futureInfo">\n            <h3 style="font-weight: 800">{{getWeekdayName(fsp.upcoming2[j][i]["Start"])}}</h3>\n            <h3>{{fromTimestampToHHMM(fsp.upcoming2[j][i]["Start"])}} - {{fromTimestampToHHMM(fsp.upcoming2[j][i]["Slutt"])}}</h3>\n          </div> \n      </ion-item>\n      <ion-item-options>\n        <button ion-button color="secondary">\n          <ion-icon name="git-compare"></ion-icon>\n          Bytt\n        </button>\n      </ion-item-options>\n    </ion-item-sliding>\n    </div>\n\n    <!-- Previous -->\n    <div style="margin-top:30px">\n    <ion-item-sliding *ngFor="let x of fsp.previous | slice:0:3, let i=index" >\n      <ion-item *ngSwitchCase="\'fullfort\'" (click)="itemSelected(x)">\n          <div class="futureDate">\n            <span style="font-size: 25px; font-weight: 900; color:#ffffff">{{timestampToDate(fsp.previous[i]["Start"]) | slice:0:2}}</span><br>\n            <span style="font-size: 21px; font-weight: 300; margin-top:0.5px;color:#ffffff">{{timestampToDate(fsp.previous[i].Start) | slice:3:6}}</span> \n          </div>\n          <div class="futureInfo">\n            <h3 style="font-weight: 800">{{getWeekdayName(fsp.previous[i]["Start"])}}</h3>\n            <h3>{{fromTimestampToHHMM(fsp.previous[i]["Start"])}} - {{fromTimestampToHHMM(fsp.previous[i]["Slutt"])}}</h3>\n          </div> \n      </ion-item>\n      <ion-item-options>\n        <button ion-button color="secondary">\n          <ion-icon name="git-compare"></ion-icon>\n          Bytt\n        </button>\n      </ion-item-options>\n    </ion-item-sliding>\n    </div>\n\n    </div>\n  </ion-list>\n      </div>\n\n</div>\n\n<div style="display:inline-block;text-align:center">\n  <img style="width:15%; border-right:2px solid #915AD5" src="../www/assets/imgs/logo.png">\n  <img style="width:30%" src="../www/assets/imgs/company_2-ny.png">\n\n</div>\n\n\n\n<br><br><br>\n\n<!--\n\n  <h3>Current Latitude: {{locationTracker.lat}}</h3>\n  <h3>Current Longitude: {{locationTracker.lng}}</h3>\n  <h3>På jobb? {{locationTracker.paJobb}}</h3> \n\n-->  \n\n  <!-- ACTIVATE IF YOU MANUALLY WANT TO START THE TRACKING. REMEBER TO CHANGE FROM NGONINIT() TO START() IN HOME.ts\n  \n    <button ion-button full primary (click)="start()">Start Tracking</button>\n     <button ion-button full primary (click)="scheduleNotification()">Send Notification</button> \n\n-->\n\n\n</ion-content>'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/pages/home/home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_2__providers_location_tracker_location_tracker__["a" /* LocationTracker */], __WEBPACK_IMPORTED_MODULE_3__angular_common_http__["a" /* HttpClient */], __WEBPACK_IMPORTED_MODULE_8__providers_firebase_service_firebase_service__["a" /* FirebaseServiceProvider */], __WEBPACK_IMPORTED_MODULE_9__providers_notifications_notifications__["a" /* NotificationsProvider */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 403:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LocationTracker; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_background_geolocation__ = __webpack_require__(404);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_geolocation__ = __webpack_require__(405);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_filter__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_filter___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_filter__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__turf_boolean_point_in_polygon__ = __webpack_require__(689);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__turf_boolean_point_in_polygon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__turf_boolean_point_in_polygon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_turf__ = __webpack_require__(692);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_turf___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_turf__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__notifications_notifications__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__firebase_service_firebase_service__ = __webpack_require__(107);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var LocationTracker = /** @class */ (function () {
    function LocationTracker(zone, backgroundGeolocation, geolocation, notifications, fsp) {
        this.zone = zone;
        this.backgroundGeolocation = backgroundGeolocation;
        this.geolocation = geolocation;
        this.notifications = notifications;
        this.fsp = fsp;
        this.lat = 0;
        this.lng = 0;
        this.paJobb = false;
        this.changed = false;
        this.sentNotification = false;
        this.hasArrived = false;
        this.initialRun = false;
    }
    LocationTracker.prototype.startTracking = function () {
        var _this = this;
        this.initialRun = true;
        // Background Tracking
        var config = {
            desiredAccuracy: 0,
            stationaryRadius: 20,
            distanceFilter: 10,
            debug: false,
            interval: 2000
        };
        this.backgroundGeolocation.configure(config).subscribe(function (location) {
            //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            // Run update inside of Angular's zone
            _this.zone.run(function () {
                _this.lat = location.latitude;
                _this.lng = location.longitude;
                _this.lastTimestamp = location.time;
                _this.insidePolygonCheck(_this.lat, _this.lng);
            });
        }, function (err) {
            //console.log(err);
        });
        // Turn ON the background-geolocation system.
        this.backgroundGeolocation.start();
        // Foreground Tracking
        var options = {
            frequency: 3000,
            enableHighAccuracy: true
        };
        this.watch = this.geolocation.watchPosition(options).filter(function (p) { return p.code === undefined; }).subscribe(function (position) {
            //console.log(position);
            // Run update inside of Angular's zone
            _this.zone.run(function () {
                _this.lat = position.coords.latitude;
                _this.lng = position.coords.longitude;
                _this.insidePolygonCheck(_this.lat, _this.lng);
                /*var now = new Date();
                if (this.paJobb && this.fsp.isWorking(now)){
                  
                  if (!this.hasArrived){
                    this.fsp.writeArrivalTime(now);
                    this.fsp.decideCheckInTime(now);
                    this.hasArrived = true;
                  }
                  
                  //Lagrer tidspunktet man ankom jobb
            
                  
                  if (this.sentNotification == false){
                    this.sentNotification =true;
                  }
                } */
                _this.lastTimestamp = position.timestamp;
            });
        });
    };
    LocationTracker.prototype.stopTracking = function () {
        console.log('stopTracking');
        this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    };
    LocationTracker.prototype.insidePolygonCheck = function (lat, lng) {
        var coordinates = [];
        console.log(this.fsp.polygon);
        for (var x = 0; x < 5; x++) {
            coordinates.push([parseFloat(this.fsp.polygon[x * 2]), parseFloat(this.fsp.polygon[x * 2 + 1])]);
        }
        var pt = __WEBPACK_IMPORTED_MODULE_5_turf___default.a.point([lat, lng]);
        //var poly = turf.polygon([coordinates]);
        //console.log(poly);
        var poly = __WEBPACK_IMPORTED_MODULE_5_turf___default.a.polygon([[
                [59.92129099886785, 10.676581263542177],
                [59.921715793124974, 10.678812861442568],
                [59.920544214017035, 10.678955353796484],
                [59.92064638252022, 10.67635897547007],
                [59.92129099886785, 10.676581263542177]
            ]]);
        //poly = turf.buffer(poly, 1.5, 'kilometers');
        console.log("ER VI PÅ JOBB?????");
        console.log(__WEBPACK_IMPORTED_MODULE_4__turf_boolean_point_in_polygon___default()(pt, poly));
        this.paJobb = __WEBPACK_IMPORTED_MODULE_4__turf_boolean_point_in_polygon___default()(pt, poly);
        if (this.paJobb == false) {
            this.sentNotification = false;
        }
    };
    LocationTracker = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgZone */], __WEBPACK_IMPORTED_MODULE_1__ionic_native_background_geolocation__["a" /* BackgroundGeolocation */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_geolocation__["a" /* Geolocation */], __WEBPACK_IMPORTED_MODULE_6__notifications_notifications__["a" /* NotificationsProvider */], __WEBPACK_IMPORTED_MODULE_7__firebase_service_firebase_service__["a" /* FirebaseServiceProvider */]])
    ], LocationTracker);
    return LocationTracker;
}());

//# sourceMappingURL=location-tracker.js.map

/***/ }),

/***/ 461:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(462);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(570);


Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_1__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 570:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(688);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_about_about__ = __webpack_require__(401);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_contact_contact__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_home_home__ = __webpack_require__(402);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pages_tabs_tabs__ = __webpack_require__(400);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__pages_settings_settings__ = __webpack_require__(118);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ionic_native_status_bar__ = __webpack_require__(398);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__ionic_native_splash_screen__ = __webpack_require__(399);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__providers_location_tracker_location_tracker__ = __webpack_require__(403);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__ionic_native_background_geolocation__ = __webpack_require__(404);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__ionic_native_geolocation__ = __webpack_require__(405);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__providers_json_json__ = __webpack_require__(965);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__angular_common_http__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__ionic_native_local_notifications__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__providers_notifications_notifications__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__providers_firebase_service_firebase_service__ = __webpack_require__(107);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__angular_http__ = __webpack_require__(966);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20_angularfire2_database__ = __webpack_require__(967);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21_angularfire2__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22_angularfire2_firestore__ = __webpack_require__(217);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
























var firebaseConfig = {
    apiKey: "AIzaSyA9Us2wtMRKTnBpFD5qPqsxUpEFU0mDIMg",
    authDomain: "tia-visma.firebaseapp.com",
    databaseURL: "https://tia-visma.firebaseio.com",
    projectId: "tia-visma",
    storageBucket: "tia-visma.appspot.com",
    messagingSenderId: "240840231790"
};
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_4__pages_about_about__["a" /* AboutPage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_contact_contact__["a" /* ContactPage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_tabs_tabs__["a" /* TabsPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_settings_settings__["a" /* SettingsPage */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_15__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_19__angular_http__["a" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_22_angularfire2_firestore__["b" /* AngularFirestoreModule */].enablePersistence(),
                __WEBPACK_IMPORTED_MODULE_20_angularfire2_database__["a" /* AngularFireDatabaseModule */],
                __WEBPACK_IMPORTED_MODULE_21_angularfire2__["a" /* AngularFireModule */].initializeApp(firebaseConfig),
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */], {
                    backButtonText: 'Tilbake'
                }, {
                    links: [
                        { loadChildren: '../pages/settings/settings.module#SettingsPageModule', name: 'SettingsPage', segment: 'settings', priority: 'low', defaultHistory: [] },
                        { loadChildren: '../pages/test/test.module#TestPageModule', name: 'TestPage', segment: 'test', priority: 'low', defaultHistory: [] }
                    ]
                })
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_4__pages_about_about__["a" /* AboutPage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_contact_contact__["a" /* ContactPage */],
                __WEBPACK_IMPORTED_MODULE_6__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_7__pages_tabs_tabs__["a" /* TabsPage */],
                __WEBPACK_IMPORTED_MODULE_8__pages_settings_settings__["a" /* SettingsPage */]
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_9__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_15__angular_common_http__["a" /* HttpClient */],
                __WEBPACK_IMPORTED_MODULE_11__providers_location_tracker_location_tracker__["a" /* LocationTracker */],
                __WEBPACK_IMPORTED_MODULE_12__ionic_native_background_geolocation__["a" /* BackgroundGeolocation */],
                __WEBPACK_IMPORTED_MODULE_13__ionic_native_geolocation__["a" /* Geolocation */],
                __WEBPACK_IMPORTED_MODULE_10__ionic_native_splash_screen__["a" /* SplashScreen */],
                __WEBPACK_IMPORTED_MODULE_16__ionic_native_local_notifications__["a" /* LocalNotifications */],
                { provide: __WEBPACK_IMPORTED_MODULE_0__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicErrorHandler */] },
                __WEBPACK_IMPORTED_MODULE_14__providers_json_json__["a" /* JsonProvider */],
                __WEBPACK_IMPORTED_MODULE_17__providers_notifications_notifications__["a" /* NotificationsProvider */],
                __WEBPACK_IMPORTED_MODULE_18__providers_firebase_service_firebase_service__["a" /* FirebaseServiceProvider */],
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 688:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(398);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(399);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_tabs_tabs__ = __webpack_require__(400);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.rootPage = __WEBPACK_IMPORTED_MODULE_4__pages_tabs_tabs__["a" /* TabsPage */];
        platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/stvale/Programmering/tia/src/app/app.html"*/'<ion-nav [root]="rootPage"></ion-nav>\n'/*ion-inline-end:"/Users/stvale/Programmering/tia/src/app/app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 965:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return JsonProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common_http__ = __webpack_require__(87);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(48);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



/*
  Generated class for the JsonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var JsonProvider = /** @class */ (function () {
    function JsonProvider(http) {
        var _this = this;
        this.http = http;
        this.weeknumbers = [];
        this.uniqueWeeknumbers = [];
        /* All data from JSON file */
        this.plan = [];
        this.test = [];
        this.keys = [];
        /* Upcoming */
        this.planUpcoming = [];
        this.planDataUpcoming = [];
        this.planDataUpcoming2 = [];
        /* Previous */
        this.planPrevious = [];
        this.planDataPrevious = [];
        this.planNext = [];
        this.http.get('../www/assets/data/arbeidsplan.json').subscribe(function (data) {
            _this.plan.push(data);
            _this.test = _this.plan[0];
            _this.keys = Object.keys(_this.plan[0]);
            _this.updateArrays();
        });
    }
    JsonProvider.prototype.updateArrays = function () {
        var currentDate = new Date();
        for (var x in this.test) {
            var dateStart = new Date(this.test[x]["Start"]);
            var dateEnd = new Date(this.test[x]["Slutt"]);
            if (dateStart.getTime() - currentDate.getTime() > 0 || dateEnd.getTime() - currentDate.getTime() > 0) {
                if (this.planNext.length == 0) {
                    this.planNext.push(this.plan[0][x]);
                }
                else {
                    this.planDataUpcoming.push(this.plan[0][x]);
                    if (this.getWeekNumber(dateStart) == this.getWeekNumber(currentDate)) {
                        this.weeknumbers.push("Denne uken");
                    }
                    else if (this.getWeekNumber(dateStart) - this.getWeekNumber(currentDate) == 1) {
                        this.weeknumbers.push("Neste uke");
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
        for (var i = 0; i < this.weeknumbers.length; i++) {
            if (this.weeknumbers[i] == this.weeknumbers[i + 1]) {
                temp.push(this.planDataUpcoming[i]);
            }
            else {
                temp.push(this.planDataUpcoming[i]);
                this.planDataUpcoming2.push(temp);
                temp = [];
            }
        }
        for (var y = 1; y < this.weeknumbers.length; y++) {
            if (this.weeknumbers[y] != this.weeknumbers[y - 1]) {
                this.uniqueWeeknumbers.push(this.weeknumbers[y]);
            }
        }
    };
    JsonProvider.prototype.getWeekNumber = function (date) {
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    };
    JsonProvider.prototype.showWeekNumber = function (i) {
        if (i == 0) {
            return true;
        }
        else if (this.weeknumbers[i] == this.weeknumbers[i - 1]) {
            return false;
        }
        else {
            return true;
        }
    };
    JsonProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_common_http__["a" /* HttpClient */]])
    ], JsonProvider);
    return JsonProvider;
}());

//# sourceMappingURL=json.js.map

/***/ })

},[461]);
//# sourceMappingURL=main.js.map