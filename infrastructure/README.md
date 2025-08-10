# Coffee Pot Monitor Infrastructure

The Coffee Pot Monitor cloud infrastructure is managed using Terraform and Cloudflare.

## Deployment

```bash
cd infrastructure
export TF_VAR_account_id="YOUR_CLOUDFLARE_ACCOUNT_ID"
export CLOUDFLARE_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"
terraform init
terraform apply -auto-approve
```
