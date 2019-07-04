
if curl -s http://localhost:5001/api/v0/id; then
    echo "✅ IPFS is up."
else
    echo "❌ IFPS is down."
fi