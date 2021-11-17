class GenericizeRankingsTable < ActiveRecord::Migration[6.1]
  def change
    add_reference :rankings, :context, polymorphic: true, index: true
    reversible do |dir|
      dir.up do
        execute "UPDATE rankings SET context_type='Event', context_id=event_id"
      end
      dir.down do
        execute "UPDATE rankings SET event_id=context_id WHERE context_type='Event'"
      end
    end
    change_column :rankings, :context_type, :string, null: false
    change_column :rankings, :context_id, :string, null: false
    rename_column :rankings,:ranking_points, :sort_order1
    rename_column :rankings,:tie_breaker_points, :sort_order2
    add_column :rankings, :sort_order3, :float
    add_column :rankings, :sort_order4, :float
    add_column :rankings, :sort_order5, :float
    add_column :rankings, :sort_order6, :float
    add_column :rankings, :matches_counted, :integer
    add_column :rankings, :wins, :integer
    add_column :rankings, :losses, :integer
    add_column :rankings, :ties, :integer
    remove_column :rankings, :event_id, index: true
  end
end
