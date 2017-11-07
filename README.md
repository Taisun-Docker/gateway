## Taisun ![Taisun](http://taisun.io/img/TaisunSmall.png)

http://taisun.io

### QuickStart

On a Docker enabled host run the following command from cli:
```
docker volume create openvpn
docker volume create ssl
docker run --name openvpn -d \
-v openvpn:/etc/openvpn \
-v ssl:/etc/ssl \
-e SERVERIP=<YOURSERVERDNSADDRESS> \
-e SQUIDUSER=<WEBPROXYUSER> \
-e SQUIDPASS=<WEBPROXYPASSWORD> \
-e DNSKEY=<DNSKEYFORDYNDNS> \
-e EMAIL=<YOUREMAIL> \
-p 1194:1194/udp \
-p 4443:443 \
--cap-add=NET_ADMIN gateway
```
