class CreateLiveStreamUrls < ActiveRecord::Migration[8.0]
  def change
    create_table :live_stream_urls do |t|
      t.belongs_to :event, null: false
      t.string :label, null: false
      t.string :url, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.timestamps
    end
  end
end
