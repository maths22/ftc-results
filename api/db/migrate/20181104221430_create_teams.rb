class CreateTeams < ActiveRecord::Migration[5.2]
  def change
    create_table :teams, id: false do |t|
      t.primary_key :number

      t.string :name
      t.string :organization
      t.string :city
      t.string :state
      t.string :country
      t.string :rookie_year

      t.timestamps
    end
  end
end
