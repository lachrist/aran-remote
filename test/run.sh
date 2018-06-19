node ../bin.js --node-port 9000 --browser-port 8080 --ca ../../otiluke/browser/ca-home --url-search-prefix aran-remote-&
REMOTE_PID=$!
sleep 1
node ../node/bin.js --host localhost:9000 --alias hello-world-node -- main.js arg0 arg1 &
http-server -p 8000 &
SERVER_PID=$!
sleep 1
/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "http://localhost:8000/index.html?aran-remote-alias=hello-world-browser" &
sleep 5
kill $REMOTE_PID
kill $SERVER_PID