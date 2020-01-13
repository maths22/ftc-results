data "aws_iam_policy_document" "asset_bucket" {
  statement {
    sid = "1"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.asset_bucket.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "asset_bucket" {
  policy = data.aws_iam_policy_document.asset_bucket.json
  bucket = aws_s3_bucket.asset_bucket.id
}

data "aws_iam_policy_document" "log_write_access" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ]

    resources = [
      "arn:aws:s3:::maths22-logs",
      "arn:aws:s3:::maths22-logs/*"
    ]
  }
}

data "aws_iam_policy_document" "results_bucket_access" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:GetObject",
      "s3:GetObjectAcl",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.upload.arn,
      "${aws_s3_bucket.upload.arn}/*"
    ]
  }
}

resource "aws_iam_role" "ec2_instance_role" {
  name = "ftc-results-${local.workspace}-instance-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = local.tags
}

resource "aws_iam_role_policy" "log_write_policy" {
  role   = aws_iam_role.ec2_instance_role.name
  policy = data.aws_iam_policy_document.log_write_access.json
}

resource "aws_iam_role_policy" "results_bucket_attach" {
  role   = aws_iam_role.ec2_instance_role.name
  policy = data.aws_iam_policy_document.results_bucket_access.json
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ftc-results-${local.workspace}-instance-profile"
  role = aws_iam_role.ec2_instance_role.name
}
