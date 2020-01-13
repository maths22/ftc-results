variable "environment" {
  type    = string
  default = ""
}

locals {
  workspace = coalesce(var.environment, terraform.workspace)
}
