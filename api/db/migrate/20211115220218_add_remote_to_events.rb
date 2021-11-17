class AddRemoteToEvents < ActiveRecord::Migration[6.1]
  def change
    add_column :events, :remote, :boolean, null: false, default: false
  end
end
