
# killall node ; clear && printf '\e[3J' ; node meta/linvail.js --node-port=9000 --alias=meta --log
# clear && printf '\e[3J' ; node ../lib/node/bin.js --host=9000 --alias=base --meta-alias=meta -- base/main.js

node $1 --node-port=9000 --alias=meta &
sleep 2
node ../lib/node/bin.js --host=9000 --alias=base --meta-alias=meta -- base/main.js
wait $!

# http-server base/ -p 8000 &
# pid1=$!
# node $1 --browser-port=8080 --alias=meta --argmpfx=META- --splitter=_META_ &
# pid2=$!
# sleep 2
# /Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools "http://localhost:8000?META-splitter=_META_&META-alias=base&META-meta-alias=meta" &
# printf "\n\nPRESS ENTER WHEN DONE\n\n"
# read -p "..."
# kill $!
# wait $pid2
# kill $pid1

# /bin/bash 1> /dev/null 2> /dev/null -c "/Applications/Firefox.app/Contents/MacOS/firefox-bin -private -devtools \"http://localhost:8000?META-splitter=_META_&META-alias=base&META-meta-alias=meta\"" &
