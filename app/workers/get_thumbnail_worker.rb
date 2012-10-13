class GetThumbnailWorker

  @queue = :thumbnail

  def self.perform( params )
    params.symbolize_keys!
  end

end