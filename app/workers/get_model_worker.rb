class GetModelWorker

  @queue = :model

  def self.perform( params )
    params.symbolize_keys!
  end

end