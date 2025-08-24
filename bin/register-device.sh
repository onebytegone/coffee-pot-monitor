#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

API_DOMAIN=$1
DEVICE_ID=${2:-$(uuidgen | tr '[:upper:]' '[:lower:]')}

if [[ -z "${API_DOMAIN}" || -z "${DEVICE_ID}" ]]; then
   echo "Usage: $0 <api-domain> [<device-id>]" >&2
   exit 1
fi

WEB_TOKEN_PAYLOAD='{"aud":"'"${API_DOMAIN}"'","authorization_details":[{"deviceID":"'"${DEVICE_ID}"'","actions":["read"]}]}'
DEVICE_TOKEN_PAYLOAD='{"sub":"'"${DEVICE_ID}"'"}'

echo "API URL: ${API_DOMAIN}"
echo "Device ID: ${DEVICE_ID}"
echo

echo "Web UI Token:"
echo

"${SCRIPT_DIR}/sign-jwt.mjs" "${WEB_TOKEN_PAYLOAD}"

echo
echo "Device Token:"
echo

"${SCRIPT_DIR}/sign-jwt.mjs" "${DEVICE_TOKEN_PAYLOAD}"

echo
