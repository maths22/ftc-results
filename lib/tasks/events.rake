namespace :events do
  desc 'TODO'
  task generate_dbs: :environment do
    # TODO: generalize season
    #
    Dir.mktmpdir do |dir|
      dest = File.join(dir, 'dbs')
      Dir.mkdir(dest)
      db_service = ScoringSystem::SqlitedbExportService.new(dest)
      db_service.season = Season.where year: '2018-2019'
      db_service.create_event_dbs
      db_service.create_server_db

      FileUtils.rm_rf(Rails.root.join('data', 'generated_scoring_dbs'))
      FileUtils.mv(dest, Rails.root.join('data', 'generated_scoring_dbs'))
    end
  end
end
