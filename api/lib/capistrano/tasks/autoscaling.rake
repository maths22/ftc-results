namespace :autoscaling do
  desc 'Bake AMIs'
  task :update_amis do
    amis = {}
    %i[Web Work].each do |role|
      server = roles(role)[0]
      instance = Aws::EC2::Instance.new server.properties.fetch(:aws_instance_id)
      amis[role] = instance.create_image no_reboot: true, name: "ftc-results-#{role.downcase}-#{fetch(:stage)}-#{now}"
    end

    amis.each do |_role, ami|
      ami.wait_until_exists
      ami.wait_until(max_attempts: 40, delay: 15) { |waiting_ami| waiting_ami.state == 'available' }
    end

    amis.each do |role, ami|
      resp = ec2_client.describe_launch_templates(
        launch_template_names: ["ftc-results-#{role.downcase}-#{fetch(:stage)}"]
      )

      launch_template = resp.launch_templates[0]

      ec2_client.create_launch_template_version(
        launch_template_data: {
          image_id: ami.id
        },
        launch_template_id: launch_template.launch_template_id,
        source_version: launch_template.latest_version_number.to_s
      )

      images_to_remove = ec2_client.describe_images(owners: ['self']).images
                                   .select { |image| image.name.start_with? "ftc-results-#{role.downcase}-#{fetch(:stage)}" }
                                   .sort_by(&:name)
                                   .reverse.drop(2)

      images_to_remove.each do |image|
        snapshots = image.block_device_mappings.reject { |bdm| bdm.ebs.nil? }.map { |bdm| bdm.ebs.snapshot_id }
        ec2_client.deregister_image(image_id: image.image_id)
        snapshots.each { |snap| ec2_client.delete_snapshot(snapshot_id: snap) }
      end
    end
  end

  def ec2_client
    @ec2_client ||= Aws::EC2::Client.new
  end
end
