terraform {
  required_version = ">= 1.5.0"
}

# Phase 3 stubs — wire providers before apply.
# module "web" { source = "./modules/vercel" }
# module "api" { source = "./modules/fly" }

output "note" {
  value = "Creator terraform stubs are placeholders until deploy credentials are configured."
}
