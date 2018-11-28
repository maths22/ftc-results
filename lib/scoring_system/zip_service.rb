module ScoringSystem
  class ZipService
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

    def add_db(zip, db_name, real_path)
      ::Zip::File.open(zip) do |zip_file|
        root_path = Pathname.new(zip_file.first.name).each_filename.to_a[0]
        zip_file.add(root_path + '/lib/db/' + db_name + '.db', real_path)
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
      @scoring_path ||= GithubService.new.latest_zip
    end
  end
end
