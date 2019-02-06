http-server base/ -p 8000 &
PID1=$!
node meta/empty-async.js 9000 8080 &
PID2=$!
sleep 1
node ../lib/node/bin.js --host 9000 --alias base -- base/main.js
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --incognito --proxy-server=127.0.0.1:8080 --auto-open-devtools-for-tabs "http://localhost:8000/" &
sleep 10
kill $PID1
kill $PID2

# 
# node meta/empty-sync.js 9001 8080 &
# sleep 1
# node ../lib/node/bin.js --host 9001 --alias base -- target.js &
# 
# 
# 
# 
# kill $!