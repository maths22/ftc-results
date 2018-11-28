class AddSlugToLeague < ActiveRecord::Migration[5.2]
  def change
    add_column :leagues, :slug, :string
  end
end
