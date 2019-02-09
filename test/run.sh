
node $1 --node-port=9000 --alias=meta &
sleep 2
node ../lib/node/bin.js --host=9000 --alias=base --meta-alias=meta -- base/main.js
kill $!

http-server base/ -p 8000 &
PID1=$!
node $1 --browser-port=8080 --alias=meta --argm-prefix=META- --splitter=_META_ &
PID2=$!
sleep 2
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --incognito --proxy-server=127.0.0.1:8080 --auto-open-devtools-for-tabs "http://localhost:8000?META-splitter=_META_&META-alias=base&META-meta-alias=meta" &
PID3=$!
read -p "Press enter to exit"
kill $PID1
kill $PID2
kill $PID3
