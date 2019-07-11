IPFS_PORT=5001

ipfs_running() {
  nc -z localhost "$IPFS_PORT"
}
start_ipfs() {
  if [ ! -f ~/.ipfs/config ]; then
    npx ipfs init
    # may need to change in future.
    npx ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
  fi
  npx ipfs daemon > /dev/null 2>&1 &
  sleep 5
}

if ipfs_running; then
    echo "✅ Using IPFS on $IPFS_PORT"
else
    echo "✨ Starting IPFS on $IPFS_PORT"
    start_ipfs
fi

exit 0