module ScoringSystem
  class GithubService
    SCORING_REPO = 'FIRST-Tech-Challenge/scorekeeper'.freeze
    ZIP_MIME_TYPE = 'application/x-zip-compressed'.freeze
    BINARY_MIME_TYPE = 'application/octet-stream'.freeze

    attr_reader :season

    def initialize(season)
      @season = season
    end

    def latest_zip
      begin
        download_file unless File.file?(path)
      rescue StandardError
        File.delete(latest_file) if File.zero?(latest_file)
        Rails.logger.error $ERROR_INFO
        return latest_file
      end
      path
    end

    private

    def latest_file
      Dir.glob(File.join(dest, '*')).max_by { |f| File.mtime(f) }
    end

    def download_file
      FileUtils.mkdir_p(dest)
      File.write(path, client.release(asset.url, accept: BINARY_MIME_TYPE).force_encoding('UTF-8'))
    end

    def path
      @path ||= File.join(dest, asset.name)
    end

    def dest
      @dest ||= Rails.root.join('data', 'scoring-download')
    end

    def client
      @client ||= Octokit::Client.new(access_token: ENV['GITHUB_API_TOKEN'])
    end

    def asset
      @asset ||= begin
        requirement = Gem::Requirement.create(season.scoring_version_constraint)
        client.releases(SCORING_REPO).filter { |entry| requirement.satisfied_by?(Gem::Version.new(entry.tag_name.sub('v', ''))) }
              .max_by { |entry| entry.tag_name.sub('v', '') }
              .assets.find { |a| a.content_type == ZIP_MIME_TYPE }
      end
    end
  end
end
