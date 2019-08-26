HealthCheck.setup do |config|
  # uri prefix (no leading slash)
  config.uri = 'rails/health_check'

  config.standard_checks -= ['emailconf']
end
