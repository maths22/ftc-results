class CreateAccessRequests < ActiveRecord::Migration[5.2]
  def change
    create_table :access_requests do |t|
      t.references :user, index: true
      t.references :event, index: true
      t.string :message
      t.string :access_token

      t.timestamps
    end
  end
end
