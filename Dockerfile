# Dockerfile for the taisun web proxy gateway
# 2017
# From node base image
FROM node:8.9

LABEL maintainer="Ryan Kuba <ryankuba@gmail.com>"

# Get Packages and easyrsa
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y curl supervisor apache2-utils && \
  curl --insecure https://dl.eff.org/certbot-auto -o /usr/local/bin/certbot-auto && \
  chmod +x /usr/local/bin/certbot-auto && \
  /usr/local/bin/certbot-auto --noninteractive --os-packages-only && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Add repo bins
ADD ./bin /usr/local/bin
RUN chmod a+x /usr/local/bin/*

# Copy over application and install dependencies
RUN mkdir -p /usr/src/Taisun-gateway
COPY . /usr/src/Taisun-gateway
WORKDIR /usr/src/Taisun-gateway
RUN npm install

#Certbot runs on port 80 app on 3000
EXPOSE 80
EXPOSE 3000

#Copy over supervisor config file
COPY ./supervisor.conf /etc/supervisor/conf.d/supervisor.conf

CMD ["/usr/bin/supervisord"]
