module ScoringSystem
  class Runner
    def run_scoring_system(db_file)
      Dir.mktmpdir do |dir|
        unzip_scoring_system(dir)
        start_scoring_system(dir)
        raise 'scoring sytem not up' unless wait_for_scoring_up

        import_db db_file
        yield "http://localhost:#{port}"
      ensure
        kill_scoring_system
      end
    end

    private

    def agent
      @agent ||= Mechanize.new
    end

    def import_db(file)
      login
      agent.post "http://localhost:#{port}/manage/import/", file: File.open(file)
    end

    def login
      login_form = agent.get("http://localhost:#{port}").link_with(text: 'Login').click.forms[0]
      login_form.username = 'local'
      agent.submit(login_form, login_form.buttons[0])
    end

    def wait_for_scoring_up
      60.times do
        sleep 0.5
        begin
          agent.get("http://localhost:#{port}")
          return true
        rescue StandardError
          # do nothing
        end
      end
      false
    end

    def unzip_scoring_system(work_dir)
      Dir.chdir work_dir
      Zip::File.open(ScoringSystem::GithubService.new(season).latest_zip) do |zipfile|
        zipfile.each do |entry|
          unless File.exist?(entry.name)
            FileUtils.mkdir_p(File.dirname(entry.name))
            zipfile.extract(entry, entry.name)
          end
        end
      end
    end

    def start_scoring_system(work_dir)
      return nil if @scoring_pid

      Dir.chdir Dir[work_dir + '/**/bin'][0]
      script = Dir[work_dir + '/**/bin/*'].reject { |s| s.include? '.bat' }[0]

      command = [script, '--unlimited', '--port', port]
      @scoring_pid = spawn(command.join(' '), %i[out err] => %w[scoring_log w])
    end

    def kill_scoring_system
      return unless @scoring_pid

      begin
        Process.kill('SIGKILL', @scoring_pid)
        Process.detach(@scoring_pid)
      rescue StandardError
        # do nothing
      end
    end

    def port
      @port ||= RandomPort::Pool.new.acquire
    end
  end
end
