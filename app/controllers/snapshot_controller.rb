class SnapshotController < ApplicationController

  def create
    @snapshot = Snapshot.create( data: params[:data], object_uuid: params[:object_id], snap_type: params[:type] )
    render :json => {
      id: @snapshot.id,
      url: object_snapshot_url( @snapshot.object_uuid, @snapshot.id, :download => 1 )
    }
  end

  def show
    if @snapshot = Snapshot.where( :object_uuid => params[:object_id], :id => params[:id] ).first
      if params[:download]
        send_file @snapshot.image.path, :filename => "snapshot-#{@snapshot.id}.png"
      else
        redirect_to @snapshot.image.url
      end
    else
      raise ActionController::RoutingError.new('Not Found')
    end
  end

end