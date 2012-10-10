require 'open-uri'

class ObjectData < ActiveRecord::Base

  attr_accessible :url, :model
  has_attached_file :model, :default_url => ''


  def fetch
    @uri = URI.parse( self.url )
    is_thingiverse = !!@uri.host.match(%r{thingiverse\.com$})
    if is_thingiverse
      return handle_html if @uri.path.match %r{^/thing:}
      return handle_stl  if @uri.path.match %r{^/download:}
    else
      return handle_stl if @uri.path.match %r{\.stl$}
    end
    raise URI::InvalidURIError
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

  def handle_html
    @uri.open do |f|
      doc = Nokogiri::HTML( f )
      
      # <div class="thing-file" id="thing-file-93009" data-adddate="2012-10-08 19:34:03" data-dlcount="6" data-filetype="stl">
      stl_files = doc.search('.thing-file[data-filetype=stl]')
      raise "No STL files found at #{@uri.to_s}!" if stl_files.empty?

      href = stl_files.first.search('a').first.attr('href') rescue nil
      raise "Could not find STL download link" unless href

      @uri = URI.join( @uri, href )
      handle_stl
    end
  end

end