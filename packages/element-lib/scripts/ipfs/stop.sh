IPFS_PORT=5001
kill $(lsof -t -i:$IPFS_PORT) 2>/dev/null
echo "🏁 IPFS Terminated"
sleep 1
exit 0
