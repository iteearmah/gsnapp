'use strict';

const fs = require('fs');

const ANDROID_PLATFORM = 'platforms/android';

if (fs.existsSync(ANDROID_PLATFORM) && fs.statSync(ANDROID_PLATFORM).isDirectory()) {
    fs.createReadStream('cordova/res')
      .pipe(fs.createWriteStream(`${ANDROID_PLATFORM}/res`));
  }