# WebRTC Server Side Video Recording Kurento

This is the sample texting application created to test live recording from WebRTC Browser side to Kurento Media Server. Here two files are with different persopose to each are created `index.html` and `index.js`.

The one file `index.html` is used to record video and save that video to Kurento Media Server, it executes it's javascript code from `index.js`. And the another file `live.html` is used to stream any existing video to browser, it executes it's javascript code from `live.js`.

## Steps to follow
* Pre-Requirements
* Install http-server
* Install bower packages
* Configuration Changes
* Run with http-server

## Pre-Requirements
* [Node.js](https://nodejs.org)
* [Bower](https://bower.io/)
* [Kurento Server](http://www.kurento.org/)

## Install http-server

[http-server](https://www.npmjs.com/package/http-server) is a simple, zero-configuration command-line http server. It is powerful enough for production usage, but it's simple and hackable enough to be used for testing, local development, and learning.

`npm install http-server -g`

## Install bower packages

If you don't have bower installed then you can install with this command: `npm install -g bower`

There are few dependent libraries which needs to be downloaded via bower

`bower install`

## Configuration Changes

Set variable values for kurento server's IP, Port and file location with file name (which is being record and saved) on `js/index.js`

```javascript
var kurentoIp = '192.168.31.133', // replace this with your kurento server IP
    kurentoPort = '8888', // replace this with your kurento server port
    fileSavePath = 'file:///tmp/abc.webm'; // replace this with your path & file name
```

Set variable values for kurento server's IP, Port and file location with file name (which is already exist to stream) on `js/live.js`

```javascript
var kurentoIp = '192.168.31.133', // replace this with your kurento server IP
    kurentoPort = '8888', // replace this with your kurento server port
    fileSavePath = 'file:///tmp/abc.webm'; // replace this with your path & file name
```

## Run with http-server

Now we are going to browse this files by running http-server on port `8443`

`http-server -p 8443`

Now you can browse files at [`http://localhost:8443/`](http://localhost:8443/)