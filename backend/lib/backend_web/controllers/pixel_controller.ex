defmodule BackendWeb.PixelController do
  use BackendWeb, :controller

  alias Backend.Repo
  alias Backend.Canvas, as: CanvasContext

  def index(conn, %{"canvas_id" => canvas_id}) do
    pixels = CanvasContext.list_pixels(canvas_id)
    json(conn, %{pixels: serialize_pixels(pixels)})
  end

  def create_or_update(conn, %{
    "canvas_id" => canvas_id,
    "x" => x,
    "y" => y,
  } = params) do
    user_id = conn.assigns.current_user.id
    params = Map.put(params, "user_id", user_id)

    case CanvasContext.upsert_pixel_by_position(
      canvas_id,
      x,
      y,
      params
    ) do
      {:ok, pixel} ->
        pixel_with_relations = Repo.preload(pixel, [:canvas, :color, :user])
        json(conn, %{pixel: serialize_pixel_with_relations(pixel_with_relations)})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: translate_errors(changeset)})
    end
  end

  defp serialize_pixels(pixels) do
    Enum.map(pixels, &serialize_pixel_with_relations/1)
  end

  defp serialize_pixel_with_relations(pixel) do
    %{
      canvas:
        %{
          id: pixel.canvas.id,
          name: pixel.canvas.name,
          width: pixel.canvas.width,
          height: pixel.canvas.height
        },
      color:
        %{
          id: pixel.color.id,
          hex: pixel.color.hex,
        },
      user:
        %{
          id: pixel.user.id,
          email: pixel.user.email
        },
      x: pixel.x,
      y: pixel.y,
    }
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
