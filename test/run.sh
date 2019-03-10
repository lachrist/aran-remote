
clear && printf '\e[3J'

node $1 --node-port=9000 --alias=meta --log &
sleep 2
node ../lib/node/bin.js --host=9000 --alias=base --meta-alias=meta -- base/main.js

# http-server base/ -p 8000 &
# PID1=$!
# node --inspect-brk $1 --browser-port=8080 --alias=meta --argm-prefix=META- --splitter=_META_ --log &
# PID2=$!
# read -p "Press enter to exit"
# /Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "http://localhost:8000?META-splitter=_META_&META-alias=base&META-meta-alias=meta" &
# # /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --incognito --proxy-server=127.0.0.1:8080 --auto-open-devtools-for-tabs "http://localhost:8000?META-splitter=_META_&META-alias=base&META-meta-alias=meta" &
# PID3=$!
# read -p "Press enter to exit"
# kill $PID1
# kill $PID2
# kill $PID3
