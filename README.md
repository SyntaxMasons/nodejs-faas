# NodeJS-FAAS

This project aims to provide a Function as a Service (FaaS) solution with minimal infrastructure requirements, avoiding the overhead of Kubernetes.

## Why Choose NodeJS-FAAS?

In the modern era, event-driven, microservice-based architecture is gaining popularity. FaaS allows you to trigger code execution based on events. However, hosting FaaS on a Kubernetes cluster can be costly. NodeJS-FAAS offers a lightweight alternative, providing an efficient lambda function solution without the need for Kubernetes. It is not intended to replace solutions like OpenFaaS but to offer a simpler, more resource-efficient option.

## How It Works

NodeJS-FAAS uses the built-in Node.js VM module to execute code.

## Setup Instructions

You can set up NodeJS-FAAS using Docker or Containerd.

### Using Docker

To pull the Docker image:

```sh
docker pull shreyasnayak21/nodejs-faas:1.2.0
```

To run the Docker container:

```sh
docker run -d -p 9256:9256 shreyasnayak21/nodejs-faas:1.2.0 --env JWT_KEY=QX2A0p84VmmLF3NYz3uHPx1hLuhT2U2K
```

### Using Containerd

To pull the image with Containerd:

```sh
nerdctl pull shreyasnayak21/nodejs-faas:1.2.0
```

To run the container with Containerd:

```sh
nerdctl run -d -p 9256:9256 shreyasnayak21/nodejs-faas:1.2.0 --env JWT_KEY=QX2A0p84VmmLF3NYz3uHPx1hLuhT2U2K
```

### Using `pm2`

You can also run the source code using `pm2`:

```sh
npm install
npm start
```

To start the NodeJS-FAAS using `pm2`:

```sh
pm2 start index.mjs --name NodeJS-FAAS
```

## Usage

Currently, NodeJS-FAAS provides an interface over an [HTTP API](openapi.json). You can create a lambda function or upload code in an `mjs` file to the instance and execute the function using the API. Future plans include adding NATS.io or Pub/Sub for function triggers.

## Example Code

### Calling the HTTP API

```mjs
const axios = require('axios');

function main(event, context, callback) {
    if (event === "get_nasa_image") {
        const { key } = context;
        axios.get(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
            .then(response => {
                if (callback) callback({
                    explanation: response.data.explanation
                });
            })
            .catch(error => {
                if (callback) callback({
                    error: error.message
                });
            });
    }
}

main(G_EVENT_NAME, G_CONTEXT, G_CALLBACK);
```

## Generating a Token

To generate a token, visit the [JWT Generator Website](https://jwt.io/). Use the JWT_KEY you provided for the container and input the following content in the body, adjusting the parameters as needed:

```json
{
    "expire_at": "1735713720",
    "issued_at": "1721994397",
    "issuer": "shreyas",
    "namespace": "neo"
}
```