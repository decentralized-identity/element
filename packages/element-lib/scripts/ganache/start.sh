GANACHE_PORT=8545

ganache_running() {
  nc -z localhost "$GANACHE_PORT" &>/dev/null
}
start_ganache() {
  . ../../example.env
  # cat "$ELEMENT_MNEMONIC"
  npx ganache-cli -i 133700 -m "$ELEMENT_MNEMONIC" > /dev/null &
  GANACHE_PID=$!
  sleep 2
}

if ganache_running; then
    echo "✅ Using GANACHE on $GANACHE_PORT"
else
    echo "✨ Starting GANACHE on $GANACHE_PORT"
    start_ganache
fi

# ./scripts/ganache/health_check.sh
npm run contracts:migrate:dev

exit 0
