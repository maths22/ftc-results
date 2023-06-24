set :aws_ec2_regions, ['us-west-2']

set :aws_ec2_application_tag, 'Project'
set :aws_ec2_application, 'Ftc-results'
set :aws_ec2_stage_tag, 'Environment'
set :aws_ec2_stage, 'Production'
set :aws_ec2_roles_tag, 'Role'

aws_ec2_register user: 'deploy', ssh_options: { keys: ["#{ENV["HOME"]}/.ssh/id_rsa"] }
