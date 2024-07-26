# NodeJS-FAAS
This project aims to achieve something similar to Function as a Service (FaaS) without the overhead of Kubernetes, with extremely low infrastructure requirements.

# Why NodeJS-FAAS? Why not any other FaaS?
In today's era, event-driven microservice-based architecture is becoming increasingly popular. Using FaaS, you can trigger any code based on events. However, when you host FaaS in a Kubernetes cluster, you also have to consider the cost per function. NodeJS-FaaS is not intended to replace options such as OpenFaaS. Instead, NodeJS-FaaS offers an extremely lightweight lambda function solution.

# How does it work?
NodeJS-FAAS utilizes the built-in Node.js VM module to execute the code.

# How to set up
You can set up NodeJS-FAAS using Docker or Containerd.

Pull using Docker:

```
docker pull shreyasnayak21/nodejs-faas:1.1.0
```

Run using Docker:

```
docker run -p 9256:9256 shreyasnayak21/nodejs-faas:1.1.0
```

Pull using Containerd:

```
nerdctl pull shreyasnayak21/nodejs-faas:1.1.0
```

Run using Containerd:

```
nerdctl run -p 9256:9256 shreyasnayak21/nodejs-faas:1.1.0
```

Alternatively, you can use `pm2` to run the source code:

```
npm install
npm start
```

You can run the Node using the following command:

```
pm2 start index.mjs --name NodeJS-FAAS
```

# How to use?
Currently, we provide an interface over [HTTP API](openapi.json). You can create a lambda function or upload code formatted in an `mjs` file to the instance, and you can execute the function using the API. Additionally, there are plans to add NATS.io or Pub/Sub to trigger a function.

# Example Code

### Call Http API

```mjs
const axios = require('axios');

function main(event, context, callback) {
    if(event=="get_nasa_image") {
        const { key } = context;
        axios.get(`https://api.nasa.gov/planetary/apod?api_key=${key}`)
        .then(response => {
            if(callback) callback({
                explanation: response.data.explanation
            });
        })
        .catch(error => {
            if(callback) callback({
                error: error.message
            });
        });   
    }
}

main(G_EVENT_NAME,G_CONTEXT,G_CALLBACK);
```