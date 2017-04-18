# Front End Preliminary Directory
This directory contains the webserver and front-end rendering components for rv3k
## Requirements
- Nodejs v.6.x.x (LTS)

_Note_: Debian-based Linux package managers don't have the latest version of Nodejs. Instead of using apt-get, download and install the latest LTS version from https://nodejs.org/

## Setup
1. Create and navigate to a convenient working directory then clone the repository using command `git clone https://github.com/patter5/rv3k.git`.
Alternatively, use GitHub desktop or some other tool to clone to your local machine. A bash-like shell is recommended.
2. navigate to `<path-to>/rv3k/front-end`
3. use command `npm install`. This will install dependencies specified in package.json and bower.json

### Running the Rocket View 3000 web server
1. use command `npm start`
2. open a browser and navigate to `localhost:8000/index.html`
