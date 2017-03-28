FROM node
RUN mkdir -p /home/nodejs/hacs
COPY . /home/nodejs/hacs
WORKDIR /home/nodejs/hacs
RUN npm install --production
CMD node src/app.js
