COUCHDB_PORT=5984
couchdb_running() {
  nc -z localhost "$COUCHDB_PORT"
}

start_couchdb() {
  docker run -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password -p 5984:5984 -d couchdb:latest > /dev/null
}

if couchdb_running; then
    echo "✅ Using COUCHDB on $COUCHDB_PORT"
else
    echo "✨ Starting COUCHDB on $COUCHDB_PORT"
    start_couchdb
fi

exit 0
