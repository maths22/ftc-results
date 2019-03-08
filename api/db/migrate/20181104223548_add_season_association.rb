class AddSeasonAssociation < ActiveRecord::Migration[5.2]
  def change
    add_reference :events, :season, index: true

    add_reference :leagues, :season, index: true
  end
end
