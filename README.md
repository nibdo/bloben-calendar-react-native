# Bloben Calendar - React Native

React Native wrapper for Bloben Calendar hosted at https://calendar.bloben.com to use some native features like access to biometrics, device keychain and automatic calendar imports from .ics files.

To be done is to find a way, how to server React App from app storage rather than loading it from the server. Source code for core web application is here https://github.com/nibdo/bloben-calendar

App is supported only for Android, but you can still use web version on Apple devices.

**React Native setup**
1. create local.properties file inside ./android folder with path to your Android SDK \
   "sdk.dir = /****"
2. create empty assets' folder inside ./android/app/src/main
3. run: "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res"

**Before Build**

npx react-native bundle --entry-file index.js  --platform android --dev false --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res


./gradlew assembleDebug for debug version OR
./gradlew assembleRelease for production version

**Bugs** 
- don't kill app after logging in, React Native need some time to persist cookies in WebView - TODO possible fix with Cookie Manager
- I don't have access to OSX so there is currently no iOS support
