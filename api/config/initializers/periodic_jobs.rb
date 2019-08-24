Delayed::Periodic.cron 'Refresh Teams', '5 * * * *' do
  Rake::Task['teams:refresh'].invoke
  Rake::Task['events:generate_dbs'].invoke
end

Delayed::Periodic.cron 'Update Twitch', '15 * * * *' do
  Rake::Task['twitch:update'].invoke
end
