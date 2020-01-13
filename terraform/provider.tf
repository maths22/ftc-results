provider "aws" {
  region  = "us-west-2"
  version = "~> 2.7"

  # TODO comment out when running in regular account
  assume_role {
    role_arn = "arn:aws:iam::119630856374:role/OrganizationAccountAccessRole"
  }
}

provider "aws" {
  region  = "us-west-2"
  version = "~> 2.7"

  alias = "dns"
}

provider "archive" {
  version = "~> 1.3"
}

