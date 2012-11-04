# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121009220356) do

  create_table "object_data", :primary_key => "uuid", :force => true do |t|
    t.string   "url"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
    t.string   "model_file_name"
    t.string   "model_content_type"
    t.integer  "model_file_size"
    t.datetime "model_updated_at"
  end

  add_index "object_data", ["url"], :name => "index_object_data_on_url", :unique => true
  add_index "object_data", ["uuid"], :name => "sqlite_autoindex_object_data_1", :unique => true

end
