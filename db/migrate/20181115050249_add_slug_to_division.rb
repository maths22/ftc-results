class AddSlugToDivision < ActiveRecord::Migration[5.2]
  def change
    add_column :divisions, :slug, :string
  end
end
