COUCHDB_PORT=5984
couchdb_running() {
  nc -z localhost "$COUCHDB_PORT"
}

start_couchdb() {
  docker run -p 5984:5984 -d couchdb > /dev/null
}

if couchdb_running; then
    echo "✅ Using COUCHDB on $COUCHDB_PORT"
else
    echo "✨ Starting COUCHDB on $COUCHDB_PORT"
    start_couchdb
fi

exit 0
