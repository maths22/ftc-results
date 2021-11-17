Delayed::Periodic.cron 'Refresh Data', '* * * * *' do
  Season.active.each { |s| FtcApi::Updater.update(s) }
end

Delayed::Periodic.cron 'Update Twitch', '15 * * * *' do
  Twitch::Updater.update
end
