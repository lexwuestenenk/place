defmodule BackendWeb.CanvasController do
  use BackendWeb, :controller

  alias Backend.Repo
  alias Backend.Canvas, as: CanvasContext
  alias BackendWeb.Serializers.Canvas, as: CanvasSerializer
  alias Backend.Canvas.Canvas
  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    canvases = CanvasContext.list_canvases()
    json(conn, %{canvases: CanvasSerializer.serialize_canvases(canvases)})
  end

  def create(conn, %{
    "name" => name,
    "width" => width,
    "height" => height,
    "cooldown" => cooldown,
  }) do
    case CanvasContext.create_canvas(
      name,
      width,
      height,
      cooldown
    ) do
      {:ok, canvas} -> json(conn, %{canvas: CanvasSerializer.serialize_canvas(canvas)})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end

  def show(conn, %{"canvas_id" => canvas_id}) do
    canvas =
      Repo.get(Canvas, canvas_id)
      |> Repo.preload([
        :colors,
        pixels: [:color]
      ])
    json(conn, %{canvas: CanvasSerializer.serialize_canvas_with_relations(canvas)})
  end

  def update(conn, %{"canvas_id" => canvas_id} = params) do
    case CanvasContext.update_canvas(canvas_id, Map.delete(params, "canvas_id")) do
      {:ok, canvas} ->
        json(conn, %{canvas: CanvasSerializer.serialize_canvas(canvas)})

      {:error, :not_found} ->
        send_resp(conn, 404, "canvas.not_found")

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: translate_errors(changeset)})
    end
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", inspect(value))
      end)
    end)
  end
end
