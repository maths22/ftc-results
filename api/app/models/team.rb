class Team < ApplicationRecord
  has_many :events_teams, dependent: :destroy
  has_many :events, through: :events_teams
  has_many :leagues_teams, dependent: :destroy
  has_many :leagues, through: :leagues_teams
  has_many :alliance_teams, dependent: :destroy
  has_many :alliances, through: :alliance_teams
  has_many :rankings, dependent: :destroy
  has_many :seasons, -> { distinct.order(year: :desc) }, through: :events

  def assign_to_league(league)
    ActiveRecord::Base.transaction do
      leagues_teams.where(league: { season: league.season }).destroy_all
      leagues_teams.create!(league: league)
    end
  end

  def match_alliances_for_season(season)
    alliances.joins(:event)
             .includes(:match_alliances)
             .where(events: { season: season })
             .flat_map(&:match_alliances)
  end

  def match_alliances
    alliances.joins(:event)
             .includes(:match_alliances)
             .flat_map(&:match_alliances)
  end

  def record(matches)
    results = matches
              .select { |m| m.match_for_team?(self) && !m.surrogate_for_team(self) && m.played }
              .group_by { |m| m.record_for_team self }
              .map { |k, v| [k, v.size] }.to_h
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
