#!/usr/bin/env bash

set -eou pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd "${SCRIPT_DIR}/.."

if [ -z "${TF_VAR_account_id}" ]; then
   echo "Error: TF_VAR_account_id is not set. Please set it to your Cloudflare account ID."
   exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN}" ]; then
   echo "Error: CLOUDFLARE_API_TOKEN is not set. Please set it to your Cloudflare API token."
   exit 1
fi

npm run build --workspace api
"${SCRIPT_DIR}/generate-keypair.sh"

if [ ! -f "infrastructure/terraform.tfstate" ]; then
   pushd infrastructure > /dev/null
   echo "Initializing Terraform state..."
   terraform init
   popd > /dev/null
fi

pushd infrastructure > /dev/null
terraform apply
