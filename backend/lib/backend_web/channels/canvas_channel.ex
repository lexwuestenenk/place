defmodule BackendWeb.CanvasChannel do
  use ChatAppWeb, :canvas

  alias ChatApp.Repo
  alias ChatAppWeb.Endpoint
  alias ChatApp.Canvas.Canvas

  @impl true
  def join("canvas:" <> canvas_id, _payload, %{assigns: %{current_user: _user}} = socket) do
    {:ok, socket}
  end

  def join("canvas:" <> _canvas_id, _payload, _socket) do
    {:error, %{reason: "unauthorized"}}
  end
end
