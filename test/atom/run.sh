node ../../bin.js --remote-analysis $1 --node-port 9000 --log &
sleep 2
node ../../node/bin.js --host 9000 --alias main -- ./target.js
kill $!