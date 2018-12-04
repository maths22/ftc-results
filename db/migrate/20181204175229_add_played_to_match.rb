class AddPlayedToMatch < ActiveRecord::Migration[5.2]
  def up
    add_column :matches, :played, :boolean, default: true
    change_column :matches, :played, :boolean, default: nil
  end

  def down
    remove_column :matches, :played
  end
end
