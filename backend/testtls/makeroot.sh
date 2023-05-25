#!/usr/bin/env sh
# $1: root key
# $2: root cert output

SUBJ="/O=Bish.com/CN=Bish.com Root CA"
SAN="subjectAltName=DNS:localhost,IP:127.0.0.1"

openssl req -x509 -key "$1" -out "$2" -sha256 -days 365 -noenc\
	-subj "$SUBJ" -addext "$SAN"
