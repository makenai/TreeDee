class CreateObjectData < ActiveRecord::Migration
  def change
    create_table( :object_data, :primary_key => :uuid ) do |t|
      t.string :uuid, :limit => 36, :null => false
      t.string :url
      t.timestamps
    end
    add_index :object_data, :url, :unique => true
    add_attachment :object_data, :model
  end
end
