defmodule BackendWeb.CanvasChannel do
  use BackendWeb, :channel
  alias BackendWeb.Endpoint
  alias BackendWeb.Presence

  @impl true
  def join("canvas:" <> canvas_id, _payload, socket) do
    case Map.get(socket.assigns, :user) do
      nil ->
        {:error, %{reason: "unauthorized"}}

      _user ->
        socket = socket
        |> assign(:canvas_id, canvas_id)
        send(self(), :after_join)
        {:ok, socket}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user.id, %{
        x: 0,
        y: 0,
        username: socket.assigns.user.username,
        color: "#000000",
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("presence.update", %{"x" => x, "y" => y, "color" => color}, socket) do
    user = socket.assigns.user

    Presence.update(socket, user.id, fn meta ->
      Map.merge(meta, %{
        x: x,
        y: y,
        color: color,
        username: user.username,
        joined_at: Map.get(meta, :joined_at, DateTime.utc_now())
      })
    end)

    {:noreply, socket}
  end

  def send_pixel(canvas_id, pixel) do
    Endpoint.broadcast(
      "canvas:#{canvas_id}",
      "pixel.updated",
      pixel
    )
  end

  def send_updated_canvas(canvas) do
    IO.puts("AJSDAKSDB JKAHSBDHABDS JAHBSJdbh")
    Endpoint.broadcast(
      "canvas:#{canvas.id}",
      "canvas.updated",
      canvas
    )
  end
end
