GANACHE_PORT=8545

ganache_running() {
  nc -z localhost "$GANACHE_PORT"
}
start_ganache() {
  . ../../example.env
  npx ganache-cli -i 133700 -m "$ELEMENT_MNEMONIC" > /dev/null 2>&1 &
  GANACHE_PID=$!
  sleep 2
  npm run contracts:migrate:dev
  cd ../../
  npx lerna run env:create:local --stream
  cd -
}

if ganache_running; then
    echo "✅ Using GANACHE on $GANACHE_PORT"
else
    echo "✨ Starting GANACHE on $GANACHE_PORT"
    start_ganache
fi

exit 0
