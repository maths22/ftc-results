class AddPlayedToMatch < ActiveRecord::Migration[5.2]
  def up
    # We want it to be clear that first we backfill true, then update the default
    add_column :matches, :played, :boolean, default: true
    change_column :matches, :played, :boolean, default: nil
  end

  def down
    remove_column :matches, :played
  end
end
