class CreateTwitchChannels < ActiveRecord::Migration[5.2]
  def change
    create_table :twitch_channels do |t|
      t.string :name
      t.string :access_token
      t.string :refresh_token
      t.timestamp :expires_at

      t.timestamps
    end
  end
end
