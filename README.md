# Documentation #

## What is this repository for? ##

* Platform as a Service API's 
* 1.0.0

## How do I get set up? ##

The required global development environment to set up this repo is:
*	`node 7.6 or above`
*	`npm`
*	`pm2`

## Local Deployment ##
```
cd <workspace>
git clone git@bitbucket.com:SOM/SOM.git
cd som-api
npm i
```

## Dev Server Update ##
```
ssh LOGIN@dev.....co
cd /var/www/<repo>
git pull
npm i
pm2 status
pm2 restart <instance_name>
```

###  Dev || Staging || Prod ###
```
npm run start || npm run staging || npm run prod
```


## Linting ##
```
npm install -g eslint

activate an eslint extension in your text editor to highlight syntax errors

linting rules default to Airbnb Javascript Style Guide: https://github.com/airbnb/javascript

project specific rules defined in eslintrc.json
```

