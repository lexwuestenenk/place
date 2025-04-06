defmodule BackendWeb.CanvasController do
  use BackendWeb, :controller

  alias Backend.Repo
  alias Backend.Canvas, as: CanvasContext
  alias Backend.Canvas.Canvas
  action_fallback BackendWeb.FallbackController

  def index(conn, _params) do
    canvases = CanvasContext.list_canvases()
    json(conn, %{canvases: serialize_canvases(canvases)})
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
      {:ok, canvas} -> json(conn, %{canvas: serialize_canvas(canvas)})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end

  def show(conn, %{"canvas_id" => canvas_id}) do
    canvas =
      Repo.get(Canvas, canvas_id)
      |> Repo.preload([:pixels, :colors])

    json(conn, %{canvas: serialize_canvas_with_relations(canvas)})
  end

  def update(conn, %{"canvas_id" => canvas_id} = params) do
    case CanvasContext.update_canvas(canvas_id, Map.delete(params, "canvas_id")) do
      {:ok, canvas} ->
        json(conn, %{canvas: serialize_canvas(canvas)})

      {:error, :not_found} ->
        send_resp(conn, 404, "canvas.not_found")

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: translate_errors(changeset)})
    end
  end

  defp serialize_canvases(canvases) do
    Enum.map(canvases, &serialize_canvas_with_colors/1)
  end

  defp serialize_canvas(canvas) do
    %{
      id: canvas.id,
      name: canvas.name,
      width: canvas.width,
      height: canvas.height,
      cooldown: canvas.cooldown,
      inserted_at: canvas.inserted_at,
      updated_at: canvas.updated_at,
    }
  end

  defp serialize_canvas_with_colors(canvas) do
    %{
      id: canvas.id,
      name: canvas.name,
      width: canvas.width,
      height: canvas.height,
      cooldown: canvas.cooldown,
      inserted_at: canvas.inserted_at,
      updated_at: canvas.updated_at,
      colors: Enum.map(canvas.colors, fn color ->
        %{
          id: color.id,
          hex: color.hex,
          index: color.index
        }
      end),
    }
  end

  defp serialize_canvas_with_relations(canvas) do
    %{
      id: canvas.id,
      name: canvas.name,
      width: canvas.width,
      height: canvas.height,
      cooldown: canvas.cooldown,
      inserted_at: canvas.inserted_at,
      updated_at: canvas.updated_at,
      colors: Enum.map(canvas.colors, fn color ->
        %{
          id: color.id,
          hex: color.hex,
          index: color.index
        }
      end),
      pixels: Enum.map(canvas.pixels, fn pixel ->
        %{
          id: pixel.id,
          x: pixel.x,
          y: pixel.y,
          color_id: pixel.color_id,
          user_id: pixel.user_id
        }
      end)
    }
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", inspect(value))
      end)
    end)
  end
end
