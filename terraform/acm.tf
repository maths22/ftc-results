resource "aws_acm_certificate" "cert" {
  provider = aws.global

  domain_name               = local.domains[local.workspace][0]
  validation_method         = "DNS"
  subject_alternative_names = local.domains[local.workspace]

  lifecycle {
    create_before_destroy = true
  }
}