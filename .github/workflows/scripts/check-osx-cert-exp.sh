#!/usr/bin/env sh

KEY_CHAIN=build.keychain
CERTIFICATE_P12=certificate.p12

# Recreate the certificate from the secure environment variable
echo $CERTIFICATE_OSX_APPLICATION | base64 --decode > $CERTIFICATE_P12

# Get expiration date of the certificate
CERT_EXPIRATION_DATE=$(openssl pkcs12 -in certificate.p12 -passin pass:$CERTIFICATE_PASSWORD -nokeys | openssl x509 -noout -enddate | cut -d= -f2)
echo "Certificate expires on: $CERT_EXPIRATION_DATE"

# Compare the expiration date with the current date
CERT_EXPIRATION_DATE=$(date -j -f "%b %d %T %Y %Z" "$CERT_EXPIRATION_DATE" +"%Y-%m-%d")
CURRENT_DATE=$(date +"%Y-%m-%d")

if [[ "$CURRENT_DATE" > "$CERT_EXPIRATION_DATE" ]]; then
  echo "The certificate has expired."
  exit 1
else
  echo "The certificate is valid."
fi
