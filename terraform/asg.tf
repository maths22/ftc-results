data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

data "aws_security_group" "dbserver" {
  name = "dbserver"
}

data "aws_security_group" "ssh_only" {
  name = "ssh-only"
}

data "aws_security_group" "http" {
  name = "http"
}

data "aws_subnets" "subnets" {
  filter {
    name   = "vpc-id"
    values = [local.vpc[local.workspace]]
  }
}

resource "aws_launch_template" "web_config" {
#   lifecycle {
#     ignore_changes = [image_id]
#   }

  name          = "ftc-results-web-${local.workspace}"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t4g.micro"

  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2_instance_profile.arn
  }

  key_name = "SSH"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [data.aws_security_group.dbserver.id, data.aws_security_group.ssh_only.id, data.aws_security_group.http.id]
  }

  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      encrypted   = "false"
      volume_size = 12
    }
  }
}

resource "aws_autoscaling_group" "web_asg" {
  name = "ftc-results-web-${local.workspace}"
  launch_template {
    name    = aws_launch_template.web_config.name
    version = "$Latest"
  }
  min_size = 1
  max_size = 1

  vpc_zone_identifier = data.aws_subnets.subnets.ids

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMaxSize",
    "GroupMinSize",
    "GroupPendingInstances",
    "GroupStandbyInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances",
  ]

  dynamic "tag" {
    for_each = local.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }

  tag {
    key                 = "Role"
    value               = "Web"
    propagate_at_launch = true
  }
}


resource "aws_launch_template" "work_config" {
#   lifecycle {
#     ignore_changes = [image_id]
#   }

  name          = "ftc-results-work-${local.workspace}"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t4g.micro"

  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2_instance_profile.arn
  }

  key_name = "SSH"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [data.aws_security_group.dbserver.id, data.aws_security_group.ssh_only.id]
  }

  block_device_mappings {
    device_name = "/dev/sda1"

    ebs {
      encrypted   = "false"
      volume_size = 12
    }
  }
}

resource "aws_autoscaling_group" "work_asg" {
  name = "ftc-results-work-${local.workspace}"
  launch_template {
    name    = aws_launch_template.work_config.name
    version = "$Latest"
  }
  min_size = 1
  max_size = 1

  vpc_zone_identifier = data.aws_subnets.subnets.ids

  enabled_metrics = [
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupMaxSize",
    "GroupMinSize",
    "GroupPendingInstances",
    "GroupStandbyInstances",
    "GroupTerminatingInstances",
    "GroupTotalInstances",
  ]

  dynamic "tag" {
    for_each = local.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }

  tag {
    key                 = "Role"
    value               = "Work"
    propagate_at_launch = true
  }
}
