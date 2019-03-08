class AddIdToEventsSponsors < ActiveRecord::Migration[5.2]
  def change
    add_column :events_sponsors, :id, :primary_key
  end
end
