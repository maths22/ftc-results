#!/usr/bin/env puma

directory '/var/www/ftc_results/current'
rackup '/var/www/ftc_results/current/config.ru'
environment '{{ rails_env }}'
pidfile '/var/www/ftc_results/shared/tmp/pids/puma.pid'
state_path "/var/www/ftc_results/shared/tmp/pids/puma.state"
stdout_redirect '/var/www/ftc_results/shared/log/puma_access.log', '/var/www/ftc_results/shared/log/puma_error.log', true

threads 0, 4

bind 'unix:///var/www/ftc_results/shared/tmp/sockets/puma.sock'

workers 0

restart_command 'bundle exec puma'


prune_bundler

on_restart do
  puts 'Refreshing Gemfile'
  ENV["BUNDLE_GEMFILE"] = "/var/www/ftc_results/current/Gemfile"
end
