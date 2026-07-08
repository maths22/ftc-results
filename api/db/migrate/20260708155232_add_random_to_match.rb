class AddRandomToMatch < ActiveRecord::Migration[8.0]
  def change
    add_column :matches, :random, :integer
  end
end
