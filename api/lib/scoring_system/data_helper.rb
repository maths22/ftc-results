module ScoringSystem
  class DataHelper
    def self.uuid_to_bytes(uuid)
      uuid.scan(/[0-9a-f]{4}/).map { |x| x.to_i(16) }.pack('n*')
    end
  end
end
