#!/usr/bin/env bash
# $1: certificate key
# $2: certificate out
# $3: root cert
# $4: root cert key

SUBJ="/O=Bish.com/CN=localhost"
SAN="subjectAltName=DNS:localhost,IP:127.0.0.1"

openssl req -new -key "$1" -out "$2.csr" -sha256\
	-subj "$SUBJ" -addext "$SAN"

openssl x509 -req -in "$2.csr" -out "$2" -days 365 -sha256\
	-CA "$3" -CAkey "$4" -CAcreateserial -extfile <(echo "$SAN")
openssl x509 -in "$2" -noout -text
rm "$2.csr"
