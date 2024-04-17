# NodeJS-FAAS
 This project aims to achieve similar to Function as a Service (FaaS) without the overhead of Kubernetes, with extremely low infrastructure requirements.

# Why NodeJS-FAAS ? Why not any other FAAS ?
In today's era, event-driven microservice-based architecture is becoming famous. Using FaaS, you can trigger any code based on events. However, when you are hosting the FaaS in any Kubernetes cluster, you also have to consider the cost per function. Node.js FaaS is not going to replace options such as OpenFaaS. Node.js FaaS is an extremely lightweight lambda function.

# How it works ? 
NodeJS-FAAS uses the built-in Node.js VM module to run the code.

# How to setup
You can setup nodejs-faas using docker or containerd

Pull using docker 

`docker pull shreyasnayak21/nodejs-faas:latest`

Run using docker

`docker run -p 9256:9256 nodejs-faas:latest`


Pull using containerd 

`nerdctl pull shreyasnayak21/nodejs-faas:latest`

Run using containerd

`nerdctl run -p 9256:9256 nodejs-faas:latest`

or also you can use `pm2` run the source code

`npm install` and `npm start`

you can run the node using following command `pm2 start index.mjs --name NodeJS-FAAS`