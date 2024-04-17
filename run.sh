#!/bin/bash

# Function to build Docker image with version from package.json
build_image() {
    version=$(jq -r '.version' package.json)
    docker build -t shreyasnayak21/nodejs-faas:$version .
}

# Function to push Docker image to registry
push_image() {
    version=$(jq -r '.version' package.json)
    docker push shreyasnayak21/nodejs-faas:$version
}

# Function to stop and remove old container, then run new build
run_container() {
    version=$(jq -r '.version' package.json)
    container_id=$(docker ps -q --filter "ancestor=shreyasnayak21/nodejs-faas:$version")
    
    if [ -n "$container_id" ]; then
        docker stop $container_id
        docker rm $container_id
    fi
    
    docker run --name nodejs-faas -p 9256:9256 shreyasnayak21/nodejs-faas:$version
}

# Function to stop and remove old container, then run new build in background 
start_container() {
    version=$(jq -r '.version' package.json)
    container_id=$(docker ps -q --filter "ancestor=shreyasnayak21/nodejs-faas:$version")
    
    if [ -n "$container_id" ]; then
        docker stop $container_id
        docker rm $container_id
    fi
    
    docker run -d --name nodejs-faas -p 9256:9256 shreyasnayak21/nodejs-faas:$version
}

# Function to kill running container
kill_container() {
    version=$(jq -r '.version' package.json)
    container_id=$(docker ps -q --filter "ancestor=shreyasnayak21/nodejs-faas:$version")
    
    if [ -n "$container_id" ]; then
        docker kill $container_id
    fi
}

# Main script
case "$1" in
    --build)
        build_image
        ;;
    --push)
        push_image
        ;;
    --run)
        run_container
        ;;
    --start)
        start_container
        ;;
    --kill)
        kill_container
        ;;
    *)
        echo "Usage: $0 {--build|--push|--run|--start|--kill}"
        exit 1
esac