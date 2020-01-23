
echo "\n🧙 Starting Element Services..."

./scripts/ganache/start.sh
./scripts/ipfs/start.sh
./scripts/couchdb/start.sh

exit 0