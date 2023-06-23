module "lb" {
  source = "github.com/maths22/aws-haproxy//terraform/modules/haproxy_lb"

  asg_name = aws_autoscaling_group.web_asg.name
  upstream_port = 80
  health_check_path = "/rails/health_check"

  providers = {
    aws = aws
  }
}
