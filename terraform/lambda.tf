data "archive_file" "lambda_archive" {
  type        = "zip"
  source_file = "${path.module}/eip_reattacher/handler.rb"
  output_path = "${path.module}/eip_reattacher.zip"
}

locals {
  eip_reattacher_name = "ftc-results-eip-reattacher-${local.workspace}"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.eip_reattacher.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.instance_launch.arn
}

data "aws_iam_policy_document" "lambda_log_policy" {
  statement {
    actions   = ["logs:CreateLogGroup"]
    resources = ["*"]
  }

  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${local.eip_reattacher_name}:*"]
  }
}

resource "aws_iam_role_policy" "lambda_log_policy" {
  policy = data.aws_iam_policy_document.lambda_log_policy.json
  role   = aws_iam_role.lambda_role.id
}

data "aws_iam_policy_document" "eip_policy" {
  statement {
    actions   = ["ec2:AssociateAddress"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "eip_policy" {
  policy = data.aws_iam_policy_document.eip_policy.json
  role   = aws_iam_role.lambda_role.id
}

resource "aws_iam_role" "lambda_role" {
  name = "ftc-results-${local.workspace}-eip-reattacher-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = local.tags
}

resource "aws_lambda_function" "eip_reattacher" {
  filename      = data.archive_file.lambda_archive.output_path
  function_name = local.eip_reattacher_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.lambda_handler"

  source_code_hash = data.archive_file.lambda_archive.output_base64sha256

  runtime = "ruby2.5"

  environment {
    variables = {
      eip_allocation_id = aws_eip.api_eip.id
      asg_name          = aws_autoscaling_group.web_asg.name
    }
  }

  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "instance_launch" {
  name = "ftc-results-eip-reattacher-${local.workspace}"

  event_pattern = jsonencode({
    detail-type = ["EC2 Instance Launch Successful"]
    source      = ["aws.autoscaling"]
  })
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.instance_launch.name
  target_id = "SendToLambda"
  arn       = aws_lambda_function.eip_reattacher.arn
}
