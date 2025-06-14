FROM node:20-bookworm-slim
RUN mkdir -p /opt/app
RUN mkdir -p /opt/app/storage/functions
RUN mkdir -p /opt/app/storage/uploads
WORKDIR /opt/app
COPY openapi.json /opt/app/openapi.json
COPY package.json /opt/app/package.json
COPY package-lock.json /opt/app/package-lock.json
RUN npm install
COPY index.mjs /opt/app/
EXPOSE 9256
CMD [ "npm", "start"]