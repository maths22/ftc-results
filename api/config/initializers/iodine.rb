if defined?(Iodine)
  # Iodine.patch_rack
  if Rails.env.development?
    Iodine.workers = 1 # TODO why is this broken
    Iodine.threads = 8
  end
  # Iodine.threads = ENV.fetch("RAILS_MAX_THREADS", 5).to_i if Iodine.threads.zero?
  # Iodine.workers = ENV.fetch("WEB_CONCURRENCY", 2).to_i if Iodine.workers.zero?
  # Iodine::DEFAULT_SETTINGS[:port] ||= ENV.fetch("PORT") if ENV.fetch("PORT")
end