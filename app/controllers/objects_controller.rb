class ObjectsController < ApplicationController

  def index
    # http://www.thingiverse.com/rss/popular
    if params[:error]
      @error_message = ObjectData.error_message( params[:error] )
    end
  end

  def show
    @object = ObjectData.find( params[:id] )
  end

  def wait
    @id = params[:object_id]
  end

  def status
    render :json => { status: ObjectData.status?( params[:object_id] ) }
  end

  def fetch
    raise URI::InvalidURIError if params[:url].empty?
    object = ObjectData.find_or_create_by_url( params[:url] )
    if object.model.exists?
      redirect_to object_url( object.id )
    else
      ObjectData.request!( object.id )
      Resque.enqueue( GetModelWorker, object.id )
      redirect_to object_wait_url( object.id )
    end
  rescue URI::InvalidURIError
    redirect_to root_url, alert: 'Invalid URL specified. Is it at thingiverse?'
  rescue Exception
    redirect_to root_url, alert: $!.to_s
  end

end
