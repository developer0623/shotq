FROM		ubuntu
MAINTAINER	eugene@taranov.me

RUN		apt-get update -q && apt install -yq \
		git \
		vim \
		g++ \
		curl
RUN		curl -O https://nodejs.org/download/release/v4.4.7/node-v4.4.7-linux-x64.tar.gz && \
		tar xf node-v4.4.7-linux-x64.tar.gz && \
                mv node-v4.4.7-linux-x64 node && \
		mv node /opt
ENV		PATH=$PATH:/opt/node/bin
RUN             npm install s3-cli -g
RUN             npm install npm -g
RUN             npm install gulp typings string-replace-loader node-sass -g
COPY		build.sh /root/
RUN		chmod +x /root/build.sh
COPY		cli.js /opt/node/lib/node_modules/s3-cli/cli.js
#ENV		AWS_SECRET_KEY=
#ENV		AWS_ACCESS_KEY=
