FROM node:6.9
RUN mkdir -p /web/shootq-ui
WORKDIR /web/shootq-ui

COPY Application/package.json /web/shootq-ui

RUN npm install -g typings && npm install -g angular-cli && npm install
ENV HOST=0.0.0.0
CMD ["npm", "start"]
EXPOSE 3000
VOLUME /web/shootq-ui