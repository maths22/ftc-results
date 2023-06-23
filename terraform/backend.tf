terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "maths22"

    workspaces {
      prefix = "ftc-results-"
    }
  }
}
