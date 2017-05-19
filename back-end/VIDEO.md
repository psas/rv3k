## Back-end video server setup

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
	
	
### How to live stream (example):

1. Install avconv:
	`sudo apt-get install libav-tools`
	
1. Download launch video:
	`wget http://annex.psas.pdx.edu/Launch-12/Video/<name>.mp4`

1. Change the argument of hls.loadSource in rv3k/front-end/app/directives/hlsjsVideo.js: `http://<host>/hls/<stream_name>.m3u8`
    - <stream_name> can be a name of your choosing

1. Ensure that nginx is running: 
	`sudo /usr/local/nginx/sbin/nginx
	`
1. Stream video to RTMP server:
	`avconv -re -i <name>.mp4 -c copy -f flv rtmp://<host>/hls/<stream name>`
	
1. Run front-end web app (see ../front-end/ for instructions)
