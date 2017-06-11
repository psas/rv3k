# Back-end video server setup
These instructions describe how to setup an nginx rtmp server for streaming
video files or webcams from a raspberry pi.

The stack consists of
- nginx
- nginx-rtmp module
- libav-tools

## General setup

1. Install dependencies
  `sudo apt-get install build-essential libpcre3 libpcre3-dev libssl-dev`

1. Install nginx and nginx-rtmp module
  - Download nginx package:
    `wget http://nginx.org/download/nginx-1.9.15.tar.gz`
    - Download nginx-rtmp module
    `wget https://github.com/arut/nginx-rtmp-module/archive/master.zip`

  - Unpack/unzip both packages
    `tar -zxvf nginx-1.9.15.tar.gz`
    `unzip master.zip`

  - Navigate to nginx folder
    `cd nginx-1.9.15`

  - Build and install nginx with nginx-rtmp module:
    `./configure --with-http_ssl_module --add-module=../nginx-rtmp-module-master`
    `make`
    `sudo make install`


1. Configure `nginx.conf` to set up RTMP server
  - Using an editor, open `/usr/local/nginx/conf/nginx.conf` and add the
       following block at the very end of the file:
  ```
    rtmp {
            server {
                    listen 1935;
                    chunk_size 4096;

                    application live {
                            live on;
                            record off;
                    }

                    application hls {
                            live on;
                            hls on;
                            hls_path /tmp/hls;

                    }
            }
    }
    ```

1. Add this inside the http block
    ```
  location /hls {
    root /tmp;
    add_header 'Access-Control-Allow-Origin' '*';
  }
  ```



1. Restart nginx
    - To stop the nginx:
      `sudo /usr/local/nginx/sbin/nginx -s stop`
    - To run:
      `sudo /usr/local/nginx/sbin/nginx`


### How to live stream a video file (example):

1. Install avconv:
  `sudo apt-get install libav-tools`

1. Download launch video:
  `wget http://annex.psas.pdx.edu/Launch-12/Video/<name>.mp4`

1. Add your video feed end-point to the `videoFeeds` array in the front-end
configuration file located at:

`rv3k/front-end/app/config.js`

The url for your endpoint will be of form
```
'http://host:port/hls/feedname.m3u8'
```

#### Test
1. Ensure that nginx is running:
  `sudo /usr/local/nginx/sbin/nginx
  `
1. Stream video to RTMP server:
  `avconv -re -i <name>.mp4 -c copy -f flv rtmp://<host>/hls/<stream name>`

1. Run front-end web app (see ../front-end/ for instructions)

### How to live stream from a webcam:
1. Install libav-tools (this includes avconv)
  `sudo apt-get install libav-tools`
2. Configure nginx.conf `sudo vim /usr/local/nginx/conf/nginx.conf` as follows:

```
# This is the nginx configuration file for setting up a simple live streaming server.
worker_processes  1;

events {
  worker_connections  1024;
}

rtmp {
  server {
    listen 8000;          # incoming port number (listens for connections) can be anything you want
    hls_fragment 500ms;   # adjusting the size of fragments affects latency. Lower is better, but uses more CPU
    ping 30s;
    notify_method get;

    application live {
      live on;
    }
    
    application hls {
        live on;
        hls on;
        hls_path /tmp/hls;
    }

  }
}

http {
  include       mime.types;
  default_type  application/octet-stream;

  sendfile        on;
  keepalive_timeout  65;

  server {
    listen       8001;    # outgoing port. This is the endpoint your application will point to.
    server_name  server.domain.com; # set this to your public domain or IP address


    location / {
      rtmp_stat all;
      rtmp_stat_stylesheet stat.xsl;
    }

    location /hls {
      root /tmp;
      add_header 'Access-Control-Allow-Origin' '*';
    }  



    location /control {
      rtmp_control all;
    }
```
3. Configure avconv for brodcasting
- This is easier to set up in a script. Either run the script in the background or initiate it in a tmux session.
```
sudo avconv -v verbose     -f video4linux2     -s 640x480     -b 256k     -r 10 -i /dev/video0     -vcodec libx264     -preset ultrafast    -an -g .5 -f flv rtmp://0.0.0.0:3585/hls/lava 
```
- the `-g .5` sets hls slices

4. Add video endpoint to the videoFeeds array in `rv3k/front-end/app/config.js`
5. Configure hls for latency in the `hlsConfig` object in `rv3k/front-end/app/config.js` as follows (some adjustment may be necessary):
```
    // HLS.js Video Player configuration
    'hlsConfig':   {
        'capLevelToPlayerSize': true,       // Caps resolution to video size (default: false)
        'debug': false,                     // Turn on and off debug logs on JS console (default: false)
        'initialLiveManifestSize': 1,       // Number of segments needed to start a playback of live stream (default: 1)
        'maxBufferLength': 30,              // Max buffer length in seconds (default: 30)
        'maxBufferSize': 60*1000*1000,      // Max buffer size in bytes (default 60 MB)
        'maxBufferHole': 0.5,               // Max inter-fragment buffer hole tolerance when searching for next fragment (default 0.5 sec)
        'maxSeekHole': 2,                   // Max buffer hole to jump if playback is stalled (default: 2 sec)
        'liveSyncDurationCount': 3,         // Edge of live delay. Playback starts at N-X fragments.
                                            // N is most recent fragment. Smaller number could introduce stalls (default: 3)
        'liveMaxLatencyDurationCount': 5,   // Max number of fragments the player is allowed to get behind (default: Infinity)
        'manifestLoadingMaxRetry': 2,       // Number of retries (default: 1)
        'levelLoadingMaxRetry': 4,          // (default: 4)
        'fragLoadingMaxRetry': 6,           // (default: 6)
        'abrBandWidthFactor': 1.1,          // Switch to lower bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                            // Value > 1 increases likelihood that bitrate is lowered (default: 0.8)
        'abrBandWidthUpFactor': 0.3         // Switch to higher bitrate if bandwidth avg * abrBandWidthFactor < level.bitrate
                                            // Value < 1 increases likelihood that bitrate is raised (default: 0.7)
    }
```
