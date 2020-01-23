
echo "\n👩‍⚕️ Checking Element Services..."

./scripts/ganache/healthcheck.sh
./scripts/ipfs/healthcheck.sh
./scripts/couchdb/healthcheck.sh

exit 0