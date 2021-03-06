require 'open-uri'

class ObjectData < ActiveRecord::Base

  attr_accessible :url, :model, :uuid
  self.primary_key = 'uuid'
  before_create :generate_uuid
  has_attached_file :model, :default_url => ''
  has_many :snapshots, :foreign_key => 'object_uuid'

  def generate_uuid
    self.id = UUIDTools::UUID.random_create.to_s
  end

  def default_image
    snapshot = self.snapshots.first
    snapshot ? "http://treedee.net#{snapshot.image.url(:medium)}" : 'http://treedee.net/assets/treedeetree.png'
  end

  def fetch_model
    @uri = URI.parse( self.url )
    is_thingiverse = !!@uri.host.match(%r{thingiverse\.com$}) rescue false
    if is_thingiverse
      return handle_html if @uri.path.match %r{^/thing:}
      return handle_derivative if @uri.path.match %r{^/derivative:}
      return handle_stl  if @uri.path.match %r{^/download:}
    else
      return handle_stl if @uri.path.match %r{\.stl$}i
    end
    raise 'Bad URL. Is it at thingiverse?'
  end

  def handle_stl
    @uri.open do |f|

      mersh = Mersh.new( f )
      data = mersh.to_json('threejs')
      
      file = StringIO.new( data )
      metaclass = class << file; self; end
      filename = @uri.path.to_s[1..-1] + '.js'
      metaclass.class_eval do
        define_method(:original_filename) { filename }
        define_method(:content_type) { 'application/json' }
      end
      
      self.model = file
      self.save
    end
  end

  def handle_derivative
    # http://www.thingiverse.com/derivative:42587
    # First, check for STL links. If there are none, go to the original object:
    @uri.open do |f|
      doc = Nokogiri::HTML( f )
      
      # <div class="thing-file" id="thing-file-93009" data-adddate="2012-10-08 19:34:03" data-dlcount="6" data-filetype="stl">
      stl_files = doc.search('.thing-file[data-filetype=stl]')
      if stl_files.empty?
        href = doc.search('#instance-meta a').select { |l| l.attr('href').match(/thing:\d+$/) }.first.attr('href') rescue nil
        raise "Could not find a link to a thing" unless href
        @uri = URI.join( @uri, href )
        handle_html
      else
        href = stl_files.first.search('a').first.attr('href') rescue nil
        raise "Could not find STL download link" unless href
        @uri = URI.join( @uri, href )
        handle_stl
      end
    end    
  end

  def handle_html
    @uri.open do |f|
      doc = Nokogiri::HTML( f )
      
      # <div class="thing-file" id="thing-file-93009" data-adddate="2012-10-08 19:34:03" data-dlcount="6" data-filetype="stl">
      stl_files = doc.search('.thing-file[data-filetype=stl]') 
      if stl_files.empty?
        stl_files = doc.search('.thing-file[data-filetype=STL]')
        raise "No STL files found at #{@uri.to_s}!" if stl_files.empty?
      end

      href = stl_files.first.search('a').first.attr('href') rescue nil
      raise "Could not find STL download link" unless href

      @uri = URI.join( @uri, href )
      handle_stl
    end
  end

  def self.request!( id )
    $redis.set "#{self.class.name}:#{id}:status", 'requested'
    $redis.set "#{self.class.name}:#{id}:last_update", Time.now
  end

  def self.complete!( id )
    $redis.set "#{self.class.name}:#{id}:status", 'complete'
    $redis.set "#{self.class.name}:#{id}:last_update", Time.now
  end

  def self.error!( id, error )
    $redis.set "#{self.class.name}:#{id}:status", 'error'
    $redis.set "#{self.class.name}:#{id}:error_message", error.to_s
    $redis.set "#{self.class.name}:#{id}:last_update", Time.now
  end

  def self.status?( id )
    $redis.get "#{self.class.name}:#{id}:status"
  end

  def self.error_message( id )
    $redis.get "#{self.class.name}:#{id}:error_message"
  end

  def self.last_update?( id )
    $redis.get "#{self.class.name}:#{id}:last_update"
  end

end