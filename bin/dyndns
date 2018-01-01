#! /bin/bash

# Ping the dynamic dns endpoint to update
function main {
  curl -s --insecure https://api.taisun.io/production/dyndns?key=$DNSKEY > /dev/null
  sleep 1800
  main
}

# Run loop
main
