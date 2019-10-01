namespace :teams do
  desc 'TODO'
  task refresh: :environment do
    Elasticsearch::Updater.update
  end
end
