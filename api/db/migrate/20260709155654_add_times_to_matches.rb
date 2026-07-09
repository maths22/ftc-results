class AddTimesToMatches < ActiveRecord::Migration[8.0]
  def change
    add_column :events, :timezone, :string
    add_column :matches, :scheduled_start, :datetime
    add_column :matches, :start, :datetime
  end
end
