class FeedItem

  attr_accessor :title, :link, :description

  def self.popular
    feed = Feedzirra::Feed.fetch_and_parse('http://www.thingiverse.com/rss/popular')
    entries = feed.entries.select { |e| e.enclosure_url.to_s.match(/\.stl$/i) }
    entries.collect { |e| self.new( e.title, e.url, e.summary ) }
  rescue
    []
  end

  def initialize( title, link, description )
    @title = title
    @link = link
    @description = description
  end

  def image
    # Messily find the first image in the description
    @description.to_s.scan(%r{<img\s+src="([^"]+)}i).flatten.first
  end

end