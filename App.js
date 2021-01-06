import React, {useEffect, useState} from 'react';
import {View, Modal, StatusBar, Linking, BackHandler} from 'react-native';
import {WebView} from 'react-native-webview';
import * as Keychain from 'react-native-keychain';
import KeychainLock from './components/KeychainLock';
import PushNotification from 'react-native-push-notification';
// import StaticServer from 'react-native-static-server';
const RNFS = require('react-native-fs');

// let server = new StaticServer(8080);

const App: () => React$Node = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEncrypted, setIsEncrypted] = useState(false);
  /*
   ICS file handling
   */
  /**
   * Read file content
   * @param url
   * @returns {Promise<void>}
   */
  const readFile = async (url) => {
    const exportedFileContent = await RNFS.readFile(url);

    const data: any = {
      action: 'eventImport',
      data: exportedFileContent,
    };
    this.webview.postMessage(JSON.stringify(data));
    // this.webview.sendJSON(JSON.stringify(data));
    // window.ReactNativeWebView.postMessage(exportedFileContent);
  };

  // Listen for file link shared
  useEffect(() => {
    // Start the server
    // server.start().then((url) => {
    //   console.log("Serving at URL", url);
    // });

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          console.log('shared string/text is ', url);
        }
      })
      .catch((err) => console.error('An error occurred', err));

    Linking.addEventListener('url', (data) => readFile(data.url));
  }, []);

  // Set Android App flag
  useEffect(() => {

    const data: any = {
      action: 'isAndroidApp',
      data: true,
    };
    this.webview.postMessage(JSON.stringify(data));

  }, []);

  const checkIfBiometricIsSupported = async () => {
    const isBiometricSupported = await Keychain.getSupportedBiometryType();

    if (isBiometricSupported === 'Fingerprint') {
      const data: any = {
        action: 'isBiometricSupported',
        data: true,
      };
      this.webview.postMessage(JSON.stringify(data));
    }
  };

  const storeEncryptionPassword = async (password) => {
    await Keychain.setGenericPassword('testname', password);

    // Send password to encrypt local storage
    const data: any = {
      action: 'encryptStorage',
      data: password,
    };
    this.webview.postMessage(JSON.stringify(data));
  };

  const handleScheduledNotifications = (data: any) => {
    // Clear all prev notifications
    PushNotification.cancelAllLocalNotifications();

    for (const item of data) {
      const {body, title, sendAt} = item;

      PushNotification.localNotificationSchedule({
        channelId: 'general',
        title,
        message: body,
        date: new Date(sendAt),
        allowWhileIdle: true,
      });
    }
  };

  const onMessage = (event: any) => {
    if (event.nativeEvent.data) {
      const messageObj: any = JSON.parse(event.nativeEvent.data);
      const {action, data} = messageObj;

      if (action === 'isBiometricSupported') {
        checkIfBiometricIsSupported();
      }

      if (action === 'prepareEncryptStorage') {
        this.webview.postMessage(
          JSON.stringify({
            action: 'prepareEncryptStorage',
            data: 'prepareEncryptStorage',
          }),
        );
      }

      if (action === 'createBiometricEncryption') {
        storeEncryptionPassword(data);
      }

      if (action === 'getDecryptPassword') {
        setIsEncrypted(true);
      }

      if (action === 'scheduledReminders') {
        handleScheduledNotifications(data);
      }
    }
  };

  const unlockApp = async () => {
    const credentials = await Keychain.getGenericPassword();

    if (credentials) {
      const {password} = credentials;
      // Send password to decrypt local storage
      const data: any = {
        action: 'decryptStorage',
        data: password,
      };
      this.webview.postMessage(JSON.stringify(data));

      setIsEncrypted(false);

    }
  };

  const backHandler = () => {
    this.webview.goBack();
    return true;
  };

  const createNotificationChanel = () => {
    PushNotification.createChannel(
      {
        channelId: "general",
        channelName: "General",
        playSound: false,
        soundName: "default",
        importance: 4,
        vibrate: false,
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }

  useEffect(() => {
    createNotificationChanel();
    BackHandler.addEventListener('hardwareBackPress', backHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };

  }, []);
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={{flex: 1}}>
        <View style={{width: '100%', height: '100%', flex: 1}}>
          <WebView
            ref={(webview) => {
              this.webview = webview;
            }}
            ignoreSslError={true}
            source={{uri: 'https://calendar.bloben.com'}}
            scalesPageToFit={true}
            sharedCookiesEnabled={true}
            onMessage={onMessage}
          />
        </View>
        {isEncrypted ? (
          <Modal>
            <KeychainLock onAuthenticate={unlockApp} />
          </Modal>
        ) : null}
      </View>
    </>
  );
};

export default App;
