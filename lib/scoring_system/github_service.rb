module ScoringSystem
  class GithubService
    SCORING_REPO = 'FIRST-Tech-Challenge/scorekeeper'.freeze
    ZIP_MIME_TYPE = 'application/x-zip-compressed'.freeze
    BINARY_MIME_TYPE = 'application/octet-stream'.freeze

    def latest_zip
      begin
        download_file unless File.file?(path)
      rescue StandardError
        File.delete(path) if File.zero?(path)
        logger.error $ERROR_INFO
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
      @client ||= Octokit::Client.new
    end

    def asset
      @asset ||= client.latest_release(SCORING_REPO)
                       .assets.find { |a| a.content_type == ZIP_MIME_TYPE }
    end
  end
end
