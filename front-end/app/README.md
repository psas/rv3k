Video.js plugin for HLS video requires a bower install work around.

First, install with: bower install --save videojs-contrib-hls
This will install all necessary files except for the dist folder.

Second, install with: npm install --save videojs-contrib-hls.
This will install the dist folder in the videojs-contrib-hls folder inside the node_modules folder.

Third, copy the dist folder into the bower_components videojs-contrib-hls folder.
This will complete the bower install the way it is supposed to be so the files can be accessed by index.html
