Delayed::Periodic.cron 'Refresh Teams', '5 * * * *' do
  Elasticsearch::Updater.update
end

Delayed::Periodic.cron 'Update Twitch', '15 * * * *' do
  Twitch::Updater.update
end
