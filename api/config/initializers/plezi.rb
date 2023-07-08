Rails.application.config.to_prepare do
  Plezi.route '/api/v1/scoring/sync/socket', LiveSync
end