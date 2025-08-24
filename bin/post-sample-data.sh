#!/usr/bin/env bash

set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

DOMAIN=$1
DEVICE_TOKEN=$2

if [[ -z "${DOMAIN}" || -z "${DEVICE_TOKEN}" ]]; then
   echo "Usage: $0 <api-domain> <device-token>" >&2
   exit 1
fi

API_URL="https://${DOMAIN}/device/report"

VALUE=$(shuf -i 100-5000 -n 1)
echo "Posting sample data to ${API_URL} with value ${VALUE}"

curl -X POST "${API_URL}" \
   -H "Authorization: Bearer ${DEVICE_TOKEN}" \
   -H "Content-Type: application/json" \
   -d '{ "reports": [ { "sensors": [ { "id": "main", "type": "weight", "value": "'"${VALUE}"'" } ] } ] }'
