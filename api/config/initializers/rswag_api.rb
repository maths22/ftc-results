Rswag::Api.configure do |c|
  c.openapi_root = Rails.root.to_s + '/swagger'
  c.swagger_filter = lambda do |swagger, env|
    swagger['servers'][0]['url'] = (Rails.env.production? ? 'https://' : 'http://') + env['HTTP_HOST']
  end
end
