require 'base64'

class Snapshot < ActiveRecord::Base

  attr_accessible :data, :object_uuid, :snap_type
  attr_accessor :data
  belongs_to :object_data, :foreign_key => 'object_uuid'
  has_attached_file :image, :styles => { :thumb => "80x80>" }
  validates_attachment_presence :image
  before_validation :get_image, :on => :create

  def self.recent
    self.order('created_at desc').take(7)
  end

  def object
    self.object_data
  end

  def get_image
    data = Base64.decode64( @data.gsub(%r{^data:([^;]+);base64,},'') )
    mime_type = $1 || 'image/png'
    file_ext = mime_type.split('/').last
    file = StringIO.new( data )
    metaclass = class << file; self; end
    filename = "snapshot.#{file_ext}"
    metaclass.class_eval do
      define_method(:original_filename) { filename }
      define_method(:content_type) { mime_type }
    end
    self.image = file
  end

end
