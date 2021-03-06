module ScoringSystem
  class ZipService
    attr_reader :season

    def initialize(season)
      @season = season
      Zip.continue_on_exists_proc = true
    end

    def with_globaldb
      ::Zip::File.open(scoring_path) do |zip_file|
        # Handle entries one by one
        zip_file.each do |entry|
          next unless File.basename(entry.name) == 'global.db'

          Dir.mktmpdir do |dir|
            path = File.join(dir, File.basename(entry.name))

            entry.extract(path)
            return yield(path)
          end
        end
      end
    end

    def transaction(zip)
      ::Zip::File.open(zip) do |zip_file|
        yield zip_file
      end
    end

    def add_sponsor_logo(zip_file, sponsor)
      sponsor.logo.open do |file|
        root_path = Pathname.new(zip_file.first.name).each_filename.to_a[0]

        zip_file.add(root_path + '/lib/public/img/sponsors/' + "#{sponsor.id}#{sponsor.logo.filename.extension_with_delimiter}", file.path)
      end
    end

    def add_db(zip_file, db_name, real_path)
      root_path = Pathname.new(zip_file.first.name).each_filename.to_a[0]
      zip_file.add(root_path + '/lib/db/' + db_name + '.db', real_path)
    end

    def add_lib(zip_file, real_path)
      root_path = Pathname.new(zip_file.first.name).each_filename.to_a[0]
      jar_name = File.basename(real_path)
      zip_file.add(root_path + '/lib/' + jar_name, real_path)

      win_file = zip_file.glob(root_path + '/bin/*.bat').first
      win_contents = zip_file.read(win_file)
      win_contents = win_contents.sub('CLASSPATH=', 'CLASSPATH=%APP_HOME%\\lib\\' + jar_name + ';')
      win_contents = win_contents.sub('org.usfirst.ftc.server.Server', 'com.maths22.ftc.ftclive.Server')
      zip_file.get_output_stream(win_file) { |f| f.write win_contents }

      mac_file = zip_file.glob(root_path + '/bin/*[^t]').first
      mac_contents = zip_file.read(mac_file)
      mac_contents = mac_contents.sub('CLASSPATH=', 'CLASSPATH=$APP_HOME/lib/' + jar_name + ':')
      mac_contents = mac_contents.sub('org.usfirst.ftc.server.Server', 'com.maths22.ftc.ftclive.Server')
      Tempfile.open 'ftcscore' do |f|
        File.chmod(mac_file.unix_perms, f)
        f.write mac_contents
        f.flush
        zip_file.replace(mac_file.name, f)
      end
    end

    def with_copy
      Tempfile.open 'ftcscore' do |f|
        f.write File.open(scoring_path).read
        f.flush
        yield f.path
      end
    end

    private

    def scoring_path
      @scoring_path ||= GithubService.new(season).latest_zip
    end
  end
end
