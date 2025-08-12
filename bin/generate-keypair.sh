#!/usr/bin/env bash

set -eou pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

mkdir -p "${SCRIPT_DIR}/../data"
cd "${SCRIPT_DIR}/../data"

if [ -f "private_key.pem" ] || [ -f "public_key.pem" ]; then
   # Keypair already exists. Skipping generation.
   exit 0
fi

openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
