namespace :deploy do
  desc 'Restart application'
  task :restart do
    on roles(:Web) do
      execute 'sudo service puma reload || (sudo service nginx restart && sudo service puma restart)'
    end
    on roles(:Work) do
      execute 'sudo service inst_jobs restart'
    end
  end
end
