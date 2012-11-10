class CreateSnapshots < ActiveRecord::Migration
  def change
    create_table :snapshots do |t|
      t.column :object_uuid, 'CHAR(36) NOT NULL'
      t.string :snap_type
      t.timestamps
    end
    add_index :snapshots, :object_uuid
    add_attachment :snapshots, :image
  end
end
