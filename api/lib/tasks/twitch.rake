namespace :twitch do
  desc 'Twitch integration tasks'
  task update: :environment do
    Twitch::Updater.update
  end
end
