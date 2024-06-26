locals {
  domains = {
    dev        = ["ftc-results-dev.maths22.com"]
    production = ["ftc-results.firstillinoisrobotics.org", "results.chicagoroboticsinvitational.com"]
  }
  cri_redirect_domain = {
    production = "results.cri.fyi"
  }
  vpc = {
    dev        = "vpc-0119b764"
    production = "vpc-03babb5c4ce4f8e82"
  }
}

