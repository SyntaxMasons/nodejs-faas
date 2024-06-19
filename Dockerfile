FROM node:20-bookworm-slim
RUN mkdir -p /opt/app
RUN mkdir -p /opt/app/functions
WORKDIR /opt/app
COPY package.json /opt/app/package.json
COPY package-lock.json /opt/app/package-lock.json
RUN npm install
COPY index.mjs /opt/app/
EXPOSE 9256
CMD [ "npm", "start"]