GIT_SHA=$(git rev-parse HEAD)
TAG="gjgd/element-api"

docker build -t $TAG:$GIT_SHA . && docker tag $TAG:$GIT_SHA $TAG:latest