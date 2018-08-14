# tia

Application for automatic check-in/check-out based on geolocation. Built with Ionic Framework to work on iOS, Android, Windows and web. 

Clone the repository with the following command: 
```
git clone https://github.com/bjarteke/tia.git
```

## Prerequisites
You need Cordova, Ionic and Angular in order to run the application.

```
npm install -g cordova
npm install -g ionic
npm install angular
```
If complications, see the following: https://ionicframework.com/docs/v1/guide/installation.html

## Dependencies

With npm:
```
npm install ionic-native --save
npm install firebase angularfire2 --save
npm install --save @ionic-native/geolocation
npm install --save @ionic-native/background-geolocation
npm install de.appplant.cordova.plugin.local-notification --save
npm install ionic-angular --save
```
You might also need to add the following ionic cordova plugins: 
```
ionic cordova plugin add cordova-plugin-mauron85-background-geolocation
ionic cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="To locate you"
```

If you are still missing some packages, see package.json for all the dependencies.

### Building

From the project folder you can build the project to iOS, android, Windows or Web (Only tested for iOS and web). 

Web:
```
ionic serve
```

iOS:
```
ionic cordova build ios
```
Then, from platforms/ios in the project, open the tia.xcodeproj and run the app! 
