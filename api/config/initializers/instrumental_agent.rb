require 'instrumental_agent'
I = Instrumental::Agent.new(ENV['INSTRUMENTAL_KEY']) unless ENV['INSTRUMENTAL_KEY'].nil?
