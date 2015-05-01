# cs130project


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
  
# Documentation
 ## Dependencies
  1. install [node](http://nodejs.org)
  2. install [grunt-cli](https://github.com/gruntjs/grunt-cli) `npm install -g grunt-cli`
  3. install dependencies with `npm install`

 ## Build and run
  Run `grunt` and open http://localhost:8000/docs in browser
