module CurrentScope
  thread_mattr_accessor :season

  def self.season_or_default
    self.season ||= Season.order(year: 'desc').first
  end
end
