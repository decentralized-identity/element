IPFS_PORT=5001

ipfs_running() {
  nc -z localhost "$IPFS_PORT" &>/dev/null
}
start_ipfs() {
  npx ipfs init > /dev/null 2>&1
  # may need to change in future.
  # npx ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001 
  npx ipfs daemon > /dev/null 2>&1 &
  # sleep 5
}

if ipfs_running; then
    echo "✅ Using IPFS on $IPFS_PORT"
else
    echo "✨ Starting IPFS on $IPFS_PORT"
    start_ipfs
fi

exit 0