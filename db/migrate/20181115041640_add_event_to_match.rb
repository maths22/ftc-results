class AddEventToMatch < ActiveRecord::Migration[5.2]
  def change
    add_reference :matches, :event, index: true
  end
end
