class CreateObjectData < ActiveRecord::Migration
  def change
    create_table( :object_data, id: false ) do |t|
      t.column :uuid, 'CHAR(36) NOT NULL PRIMARY KEY'
      t.string :url
      t.timestamps
    end
    add_index :object_data, :url, :unique => true
    add_attachment :object_data, :model
  end
end
