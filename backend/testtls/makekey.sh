#!/usr/bin/env sh
# $1: key out
openssl genpkey -out "$1" -algorithm RSA -pkeyopt rsa_keygen_bits:4096
