DOCKER_ID=$(docker ps -a -q --filter ancestor=couchdb:latest --format="{{.ID}}")
docker stop $DOCKER_ID > /dev/null
docker rm $DOCKER_ID > /dev/null
echo "🏁 COUCHDB Terminated"
exit 0