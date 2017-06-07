# ShootQ front-end Angular 2 App

### What you need to run this app:
  * node and npm (brew install node)
  * Ensure you're running the latest versions **Node v7.x.x+ and NPM 3.x.x+**

##### Run ```npm install -g npm@3.10.8``` in order to get npm v3.10.8 installed #####

##### Once you have those, you should install these globals with npm install --global:

  * webpack (```npm install --global webpack```)
  * webpack-dev-server (```npm install --global webpack-dev-server```)
  * karma (```npm install --global karma-cli```)
  * protractor (```npm install --global protractor```)
  * typescript (```npm install --global typescript```)
  
### Configuring app

###### Since we're using vagrant for development as a conteiner for the app may be (if you are not going to use Vagrant) you may need to clone and edit the following file:

### Keep in mind this is not mandatory, just a suggestion.

```/shootq/Application/config/webpack.dev.js``` to ```/shootq/Application/config/webpack.{your_name}.js``` 

```javascript
/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig.metadata, {
  host: '{your_ip}',
  port: 3000,
  ENV: ENV,
  HMR: HMR
});
```

###### and then edit: ```/shootq/Application/webpack.config.js```

###### and edit the following line: 

```javascript  
case 'dev':
  case 'development':
  default:
    module.exports = require('./config/webpack.dev'); 
    //replacing the above line with the file with your name, like:
    module.exports = require('./config/webpack.{your_name}'); //replacing by your file with your name
```
##### You need to install the following before start the server: (if you don't have already installed those packages)
* ```npm install -g gulp```
* ```npm install -g typings```

##### Install Theme Remark Dependencies 

  * Go to the theme path, should be: ```$ shootq/Application/src/app/assets/theme/```
  * Execute the following command ```npm install```
  * This require you've **gulp** previously installed globally.

##### Once you've properly configured the server host and port, you will be able to:

  * Standing in ```$ /shoot1/Application/ ```
  * ```npm install``` to install all dependencies (please do this each time before run the project, because we're working and adding new components each day.)
  * ```typings install``` to install typings dependecies (please do this each time before run the project, because we're working and adding new components each day.)
  * ```npm run server``` to start the dev server in another tab
  
  


