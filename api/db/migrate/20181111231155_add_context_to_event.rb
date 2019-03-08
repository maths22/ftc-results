class AddContextToEvent < ActiveRecord::Migration[5.2]
  def change
    add_reference :events, :context, polymorphic: true, index: true
  end
end
