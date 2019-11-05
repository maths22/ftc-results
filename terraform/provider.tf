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
  backend "s3" {
    bucket = "maths22-remote-tfstate"
    region = "us-west-2"
    key    = "ftc-results.tfstate"
  }

  required_version = "~> 0.12.7"
}

