class GiveDivisionsSlugs < ActiveRecord::Migration[7.0]
  def change
    change_table :event_divisions do |t|
      t.rename :number, :slug
      t.change :slug, :text
    end
  end
end
