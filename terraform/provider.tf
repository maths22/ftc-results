provider "aws" {
  region  = "us-west-2"

  # TODO comment out when running in regular account
  assume_role {
    role_arn = "arn:aws:iam::119630856374:role/admin"
  }
}

provider "aws" {
  region  = "us-east-1"

  alias = "global"

  # TODO comment out when running in regular account
  assume_role {
    role_arn = "arn:aws:iam::119630856374:role/admin"
  }
}


provider "aws" {
  region  = "us-west-2"

  alias = "dns"
}
