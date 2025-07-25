require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
require 'action_cable/engine'
require 'sprockets/railtie'
require 'rails/test_unit/railtie'

require 'rack/handler/iodine'
# Fix for surprising multipart behavior with iodine
module RackMultipartParserFix
  def initialize(...)
    super
    @sbuf = StringScanner.new("".b.dup)
  end
end
Rack::Multipart::Parser.prepend(RackMultipartParserFix)
::Rackup::Handler.register(:iodine, Iodine::Rack) if defined?(::Rackup::Handler)
ENV['RACKUP_HANDLER'] ||= 'iodine'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

class Profiler
  def initialize(app)
    @app = app
  end

  def profiling_filename(env)
    filename_friendly_path = env['PATH_INFO'].tr('/', ' ').strip.tr(' ', '-')
    filename_friendly_path = 'root' if filename_friendly_path == ''

    "#{filename_friendly_path}.prof.txt"
  end

  def call(env)
    # Begin profiling
    RubyProf.measure_mode = RubyProf::WALL_TIME
    RubyProf.start

    # Run all app code
    res = @app.call(env)

    # Stop profiling & save
    out = RubyProf.stop
    File.open("perflog/#{profiling_filename(env)}", 'w+') do |file|
      RubyProf::FlatPrinter.new(out).print(file)
    end

    res
  end
end

module FtcResults
  class Application < Rails::Application
    config.load_defaults 8.0

    # prevent segfault in sassc :sob:
    config.assets.configure do |env|
      env.export_concurrent = false
    end

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    config.active_record.schema_format = :sql

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = false

    config.time_zone = 'America/Chicago'

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.middleware.use Rack::MethodOverride
    config.middleware.use ActionDispatch::Flash

    # config.middleware.use ::Profiler

    config.log_formatter = Logger::Formatter.new

    config.autoload_paths << Rails.root.join('lib')
    config.eager_load_paths << Rails.root.join('lib')

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: %i[get post options put delete],
                      expose: DeviseTokenAuth.headers_names.values
      end
    end
  end
end
