# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever
set :output, '/dev/stdout'

set :job_template, "bash -l -c 'set -a; . /opt/environment; :job'"

every 1.hour, at: 5 do # 1.minute 1.day 1.week 1.month 1.year is also supported
  rake 'teams:refresh events:generate_dbs'
end

every 1.hour, at: 15 do
  rake 'twitch:update'
end