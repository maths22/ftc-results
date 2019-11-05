resource "aws_s3_bucket" "upload" {
  bucket = "ftc-results-upload-${terraform.workspace}"
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = ["https://ftc-results.firstillinoisrobotics.org"]
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }

  tags = local.tags
}
