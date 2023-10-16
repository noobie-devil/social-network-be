FROM node:alpine as development
WORKDIR /usr/social-network-be/server
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "start"]
#CMD ["npm", "run", "dev"]
