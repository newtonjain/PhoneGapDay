exports.config = {
    framework: 'jasmine2',

    seleniumAddress:"http://localhost:4723/wd/hub",
    capabilities: {
            // You can use other browsers
            // like firefox, phantoms, safari, IE (-_-)
            //'appium-version': '1.4.16',
            browserName:'',
            platformName: 'Android',
            platformVersion: '4.4.2',
            deviceName: 'Android Emulator',
            app: '/Users/subhagpo/Desktop/Apps/PhoneGapDay/platforms/android/build/outputs/apk/android-debug.apk'
    },
    /*
    baseUrl: 'http://localhost:8100',

    capabilities: {
            // You can use other browsers
            // like firefox, phantoms, safari, IE (-_-)
            browserName:'chrome'
    },
    */
    specs: [
            // We are going to make this file in a minute
        'e2e/*.tests.js'
    ],
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        isVerbose: true,
    },
    allScriptsTimeout: 20000,
    
    onPrepare: function(){
        /*
        browser.driver.get('http://localhost:8100');
        */
        var wd = require('wd'),
        protractor = require('protractor'),
        wdBridge = require('wd-bridge')(protractor, wd);
        wdBridge.initFromProtractor(exports.config);
    }
};