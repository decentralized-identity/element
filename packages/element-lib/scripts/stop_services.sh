
echo "\n🧙 Stopping Element Services..."

./scripts/ganache/stop.sh
./scripts/ipfs/stop.sh
./scripts/couchdb/stop.sh

exit 0