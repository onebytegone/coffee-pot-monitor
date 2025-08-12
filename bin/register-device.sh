#!/usr/bin/env bash

set -eou pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

DEVICE_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

WEB_TOKEN_PAYLOAD='{"authorization_details":[{"deviceID":"'"${DEVICE_ID}"'","actions":["read"]}]}'
DEVICE_TOKEN_PAYLOAD='{"sub":"'"${DEVICE_ID}"'"}'

echo "Web UI Token:"
echo

"${SCRIPT_DIR}/sign-jwt.mjs" "${WEB_TOKEN_PAYLOAD}"

echo
echo "Device Token:"
echo

"${SCRIPT_DIR}/sign-jwt.mjs" "${DEVICE_TOKEN_PAYLOAD}"

echo
