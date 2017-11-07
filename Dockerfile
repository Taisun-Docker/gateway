# Dockerfile for the taisun web proxy gateway
# 2017
# From jessie
FROM debian:jessie

LABEL maintainer="Ryan Kuba <ryankuba@gmail.com>"

# Get Packages and easyrsa
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y openvpn curl iptables squid3 supervisor apache2-utils && \
  curl --insecure https://www.taisun.io/EasyRSA-3.0.3.tgz | tar xzf - -C /usr/share/ && \
  chown -R root:root /usr/share/EasyRSA-3.0.3/ && \
  ln -s /usr/share/EasyRSA-3.0.3/easyrsa /usr/local/bin && \
  curl --insecure https://www.taisun.io/squid3_3.4.8-6%2Bdeb8u4_amd64.deb -o squid3.deb && \
  dpkg -i squid3.deb && rm -f squid3.deb && \
  curl --insecure https://dl.eff.org/certbot-auto -o /usr/local/bin/certbot-auto && \
  chmod +x /usr/local/bin/certbot-auto && \
  /usr/local/bin/certbot-auto && \
  apt-get clean && \ 
  rm -rf /var/lib/apt/lists/*

# Needed by scripts credit to (https://github.com/kylemanna/docker-openvpn)
ENV OPENVPN /etc/openvpn
ENV EASYRSA /usr/share/EasyRSA-3.0.3
ENV EASYRSA_PKI $OPENVPN/pki
ENV EASYRSA_VARS_FILE $OPENVPN/vars

# Prevents refused client connection because of an expired CRL
ENV EASYRSA_CRL_DAYS 3650

# Add repo bins
ADD ./bin /usr/local/bin
RUN chmod a+x /usr/local/bin/*

#Copy over supervisor config file, squid basic config, and dynamic dns cronjob
COPY ./supervisor.conf /etc/supervisor/conf.d/supervisor.conf
COPY ./squid.conf /etc/squid3/squid.conf
COPY ./crontab /etc/crontab

CMD ["/usr/bin/supervisord"]
