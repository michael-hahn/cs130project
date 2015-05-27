# Vantage


# Testing App
## [Installation](http://ionicframework.com/docs/guide/installation.html)
  1. Have Node.js installed `sudo apt-get install nodejs`
  2. Have npm installed `sudo apt-get install npm`
  3. `sudo npm install -g cordova`
  4. `sudo npm install -g ionic`
 
## Desktop browser testing
  `ionic serve -f <browser>`
   browser can be `safari`, `firefox`, `chrome`

## Mobile device testing
  (Note: must have necessary platforms dependencies installed)
  1. `ionic platform add ios`
      or
     `ionic platform add android`
  2. `ionic build ios` or `ionic build android`
  3. `ionic emulate ios` or `ionic emulate ios`
  
OR (Preferred)

  1. Download 'Ionic View' app from Google Play Store or Apple Store
  2. Choose 'Preview Shared App' and input App ID: 29359353 
  
# Documentation

## Dependencies
  1. install [node](http://nodejs.org)
  2. install [grunt-cli](https://github.com/gruntjs/grunt-cli) `npm install -g grunt-cli`
  3. install dependencies (grunt-ngdocs, grunt-contrib-connect, and grunt-contrib-clean) with `npm install`

## Build and run
  Run `grunt` and open http://localhost:8000/docs in browser
