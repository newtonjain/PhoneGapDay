#SrWAY

PhoneGap day demo application that allows the users to participate in a survey using his/her mobile phone.
The user signs in using his/her FaceBook account and provides ratings to the questions by moving the phone. 

## Using the application - 
Once you sign in using your FB Account, the application presents the user with a series of questions on a stack of cards. 
The user tilts the phone left/right to rate the questions.  To flip to the next question, the user moves the phone towards him/her and 
to return to the previous question, flip the phone back, such that the head of the phone is pointing to the ground. 

## Getting Started - 
* Git Clone the workspace
* At the root, type "npm install"
* At the root, type "bower install" 
* At the root, install the following plugins -
    * cordova-plugin-whitelist
    * cordova-plugin-inappbrowser
    * cordova-plugin-device-motion
    * cordova-plugin-vibration
    * cordova-plugin-code-push

## Building the application - 
 
 Once you enlist or sync to the git repo, remove all the previously added platforms and re-add them. This will also
 add the plugins since they are saved into the config.xml.
 Also run,
* sudo npm install
* bower install
 
in the project root folder to get the package dependencies.
 
After getting all the plugins and dependencies, build the application using 
*cordova build/run/emulate [platform]*