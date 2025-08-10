terraform {
   required_providers {
      cloudflare = {
         source = "cloudflare/cloudflare"
         version = "5.8.2"
      }
   }
}

provider "cloudflare" {}

resource "cloudflare_workers_script" "api" {
   account_id = var.account_id
   script_name = "coffee-pot-monitor-api"
   content_file = "../api/dist/index.js"
   content_sha256 = filesha256("../api/dist/index.js")
   compatibility_flags = [ "nodejs_compat" ]
   compatibility_date = "2025-08-10"
   main_module = "index.js"
}

resource "cloudflare_workers_script_subdomain" "example_workers_script_subdomain" {
   account_id = var.account_id
   script_name = cloudflare_workers_script.api.script_name
   enabled = true
   previews_enabled = false
}
