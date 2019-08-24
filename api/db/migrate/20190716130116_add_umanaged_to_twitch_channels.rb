class AddUmanagedToTwitchChannels < ActiveRecord::Migration[5.2]
  def change
    add_column :twitch_channels, :unmanaged, :boolean, null: false, default: false
  end
end
