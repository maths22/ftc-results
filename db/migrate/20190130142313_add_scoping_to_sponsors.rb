class AddScopingToSponsors < ActiveRecord::Migration[5.2]
  def change
    add_column :sponsors, :global, :boolean
  end
end
