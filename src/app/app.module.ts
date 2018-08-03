import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingsPage } from '../pages/settings/settings';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';

import { JsonProvider } from '../providers/json/json';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { NotificationsProvider } from '../providers/notifications/notifications';

import { FirebaseServiceProvider } from '../providers/firebase-service/firebase-service';
import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';



const firebaseConfig = {
    apiKey: "AIzaSyA9Us2wtMRKTnBpFD5qPqsxUpEFU0mDIMg",
    authDomain: "tia-visma.firebaseapp.com",
    databaseURL: "https://tia-visma.firebaseio.com",
    projectId: "tia-visma",
    storageBucket: "tia-visma.appspot.com",
    messagingSenderId: "240840231790"
  };

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireDatabaseModule, 
    AngularFireModule.initializeApp(firebaseConfig),
    IonicModule.forRoot(MyApp, {
      backButtonText: 'Tilbake'
     })

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    HttpClient,
    LocationTracker,
    BackgroundGeolocation,
    Geolocation,
    SplashScreen,
    LocalNotifications,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    JsonProvider,
    NotificationsProvider,
    FirebaseServiceProvider,
  ]
})
export class AppModule {}
