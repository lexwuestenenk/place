defmodule BackendWeb.CanvasChannel do
  use BackendWeb, :channel
  alias BackendWeb.Endpoint

  @impl true
  def join("canvas:" <> _canvas_id, _payload, socket) do
    IO.inspect(socket.assigns, label: "JOIN SOCKET ASSIGNS")

    case Map.get(socket.assigns, :current_user) do
      nil ->
        {:error, %{reason: "unauthorized"}}

      _user ->
        {:ok, socket}
    end
  end

  def join("canvas:" <> _canvas_id, _payload, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def send_pixel(canvas_id, pixel) do
    Endpoint.broadcast(
      "canvas:#{canvas_id}",
      "pixel.updated",
      pixel
    )
  end
end
