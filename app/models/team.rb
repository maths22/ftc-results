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
