terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "maths22"

    workspaces {
      prefix = "ftc-results-"
    }
  }

  required_version = "~> 0.12.7"
}
