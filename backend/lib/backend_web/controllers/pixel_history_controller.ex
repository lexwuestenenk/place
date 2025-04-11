defmodule BackendWeb.PixelHistoryController do
  use BackendWeb, :controller

  alias Backend.Canvas, as: CanvasContext
  alias BackendWeb.Serializers.PixelHistory, as: PixelHistorySerializer

  def index(conn, %{"canvas_id" => _canvas_id, "pixel_id" => pixel_id}) do
    pixel_histories = CanvasContext.list_pixel_histories(pixel_id)
    json(conn, %{pixel_histories: PixelHistorySerializer.serialize_pixel_histories(pixel_histories)})
  end
end
