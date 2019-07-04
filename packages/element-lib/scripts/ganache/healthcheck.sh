if curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":0}' http://localhost:8545; then
    echo "✅ GANACHE is up."
else
    echo "❌ GANACHE is down."
fi