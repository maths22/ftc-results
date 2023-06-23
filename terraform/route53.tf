data "aws_route53_zone" "maths22" {
  provider = aws.dns

  name         = "maths22.com."
}

resource "aws_route53_record" "api" {
  provider = aws.dns

  zone_id = data.aws_route53_zone.maths22.id
  name    = "api.${local.workspace}.ftc-results.maths22.com"
  type    = "CNAME"
  ttl     = "300"
  records = [module.lb.dns_name]
}

resource "aws_route53_record" "cloudfront" {
  provider = aws.dns
  
  zone_id = data.aws_route53_zone.maths22.id
  name    = "${local.workspace}.ftc-results.maths22.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
