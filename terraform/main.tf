data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  tags = {
    Project     = "Ftc-results"
    Environment = title(local.workspace)
  }
}

resource "aws_s3_bucket" "asset_bucket" {
  bucket = "ftc-results-assets-${local.workspace}"
  acl    = "public-read"

  website {
    index_document = "index.html"
  }

  tags = local.tags
}

resource "aws_cloudfront_distribution" "distribution" {
  price_class     = "PriceClass_100"
  enabled         = true
  is_ipv6_enabled = true

  default_root_object = "index.html"

  aliases = local.domains[local.workspace]

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.cert.arn
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
    origin_id   = "asset-bucket"
    domain_name = aws_s3_bucket.asset_bucket.bucket_regional_domain_name
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
    target_origin_id = "asset-bucket"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    compress         = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/assets/*"
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

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "api-host"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }

      headers = [
        "Accept",
        "Accept-Encoding",
        "Authorization",
        "Host",
        "x-access-token",
        "x-client",
        "x-expiry",
        "x-token-type",
        "x-uid"
      ]
    }

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern     = "/rails/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "api-host"

    forwarded_values {
      query_string = true

      cookies {
        forward           = "whitelist"
        whitelisted_names = ["_ftc_results_session"]
      }

      headers = [
        "Accept",
        "Accept-Charset",
        "Accept-Datetime",
        "Accept-Encoding",
        "Accept-Language",
        "Authorization",
        "Host",
        "Content-Length",
        "Content-Type",
      ]
    }

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

output "distribution_url" {
  value = aws_cloudfront_distribution.distribution.domain_name
}

