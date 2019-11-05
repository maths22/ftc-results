require 'aws-sdk-ec2'

def lambda_handler(event:, context:)
  return unless event['detail']['AutoScalingGroupName'] == ENV['asg_name']

  ec2_client.associate_address({
                                   allocation_id: ENV['eip_allocation_id'],
                                   instance_id: event['detail']['EC2InstanceId'],
                               })
end

def ec2_client
  @ec2_client ||= Aws::EC2::Client.new
end
