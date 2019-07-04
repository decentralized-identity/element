GANACHE_PORT=8545
kill $(lsof -t -i:$GANACHE_PORT) 2>/dev/null
echo "🏁 GANACHE Terminated"
exit 0