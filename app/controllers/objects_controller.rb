class ObjectsController < ApplicationController

  def index
  end

  def show
    @object = ObjectData.find( params[:id] )
  end

  def fetch
    object = ObjectData.find_or_create_by_url( params[:url] )
    unless object.model.exists?
      object.fetch
    end
    redirect_to object_url( object.id )
  rescue URI::InvalidURIError
    redirect_to root_url, alert: 'Invalid URL specified. Is it at thingiverse?'
  rescue Exception
    redirect_to root_url, alert: $!.to_s
  end

end
