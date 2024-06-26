resource "aws_cloudfront_distribution" "cri_redirect_distribution" {
  price_class     = "PriceClass_100"
  comment = "Distribution for CRI short url redirects"
  enabled         = true
  is_ipv6_enabled = true

  aliases = [local.cri_redirect_domain[local.workspace]]

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.cri_redirect_cert.arn
    ssl_support_method             = "sni-only"
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.1_2016"
  }

  tags = local.tags

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  origin {
    origin_id   = "api-host"
    domain_name = aws_route53_record.api.fqdn

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    compress         = true
    target_origin_id = "api-host"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }

      headers = [
        "Accept",
        "Accept-Charset",
        "Accept-Datetime",
        "Accept-Encoding",
        "Accept-Language",
        "Host",
      ]
    }

    viewer_protocol_policy = "redirect-to-https"
  }
}