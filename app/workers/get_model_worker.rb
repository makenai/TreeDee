class GetModelWorker

  @queue = :model

  def self.perform( id )
    if objectData = ObjectData.find( id )
      objectData.fetch_model()
      ObjectData.complete!( id )
    end
  end

  def self.on_failure( e, id )
    ObjectData.error!( id, e.to_s )
  end

end