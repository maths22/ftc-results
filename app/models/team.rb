class Team < ApplicationRecord
  has_and_belongs_to_many :events
  has_and_belongs_to_many :divisions
  has_many :alliance_teams
  has_many :alliances, through: :alliance_teams
  has_many :rankings

  def match_alliances_for_season(season)
    alliances.joins(:event)
             .includes(:match_alliances)
             .where(events: { season: season }).flat_map(&:match_alliances)
  end

  def record(matches)
    results = matches.find_all { |m| m.match_for_team?(self) && !m.surrogate_for_team(self) }.group_by { |m| m.rp_for_team self }.map{|k,v| [k,v.size]}.to_h
    {
      win: results[2] || 0,
      loss: results[0] || 0,
      tie: results[1] || 0
    }
  end

  def display_name
    name_display = name.nil? ? '' : (' (' + name + ')')
    number.to_s + name_display
  end

  rails_admin do
    object_label_method do
      :display_name
    end
  end
end
