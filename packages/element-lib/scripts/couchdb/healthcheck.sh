if curl -s http://127.0.0.1:5984 > /dev/null; then
    echo "✅ COUCHDB is up."
else
    echo "❌ COUCHDB is down."
fi