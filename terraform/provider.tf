provider "aws" {
  region  = "us-west-2"
  version = "~> 2.7"

  # TODO comment out when running in regular account
  assume_role {
    role_arn = "arn:aws:iam::119630856374:role/OrganizationAccountAccessRole"
  }
}

provider "archive" {
  version = "~> 1.3"
}

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

