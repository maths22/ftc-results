locals {
  domains = {
    dev        = ["ftc-results-dev.maths22.com"]
    production = ["ftc-results.firstillinoisrobotics.org"]
  }
  cert_arns = {
    dev        = "arn:aws:acm:us-east-1:902151335766:certificate/44099ea8-fdb6-4bba-bad8-7848e5e72489"
    production = "arn:aws:acm:us-east-1:119630856374:certificate/b6ff677b-7664-43e7-876e-9be465181276"
  }
  vpc = {
    dev        = "vpc-0119b764"
    production = "vpc-03babb5c4ce4f8e82"
  }
}

