terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

locals {
  aws_config_path = "../aws.conf"
}

provider "aws" {
  region  = "us-west-2"

  shared_config_files = [local.aws_config_path]
  profile = "maths22-fir"
}

provider "aws" {
  region = "us-east-1"

  alias = "global"

  shared_config_files = [local.aws_config_path]
  profile = "maths22-fir"
}

provider "aws" {
  region  = "us-west-2"

  alias = "dns"

  shared_config_files = [local.aws_config_path]
  profile = "maths22"
}
