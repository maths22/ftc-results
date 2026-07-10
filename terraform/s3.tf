resource "aws_s3_bucket" "upload" {
  bucket = "ftc-results-upload-${local.workspace}"

  tags = local.tags
}

resource "aws_s3_bucket_acl" "upload" {
  bucket = aws_s3_bucket.upload.id
  acl = "private"
}

resource "aws_s3_bucket_cors_configuration" "upload" {
  bucket = aws_s3_bucket.upload.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "DELETE"]
    allowed_origins = ["https://ftc-results.firstillinoisrobotics.org", "https://results.chicagoroboticsinvitational.com"]
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}
