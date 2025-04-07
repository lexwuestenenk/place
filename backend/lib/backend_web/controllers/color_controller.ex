defmodule BackendWeb.ColorController do
  use BackendWeb, :controller

  alias Backend.Canvas, as: CanvasContext
  alias BackendWeb.Serializers.Color, as: ColorSerializer

  def index(conn, %{"canvas_id" => canvas_id}) do
    colors = CanvasContext.list_colors(canvas_id)
    json(conn, %{colors: ColorSerializer.serialize_colors(colors)})
  end

  def create(conn, %{
    "canvas_id" => canvas_id,
    "hex" => hex,
    "index" => index,
  }) do
    case CanvasContext.create_color(canvas_id, hex, index) do
      {:ok, color} -> json(conn, %{color: ColorSerializer.serialize_color(color)})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end

  def update(conn, %{"canvas_id" => canvas_id, "color_id" => color_id} = params) do
    case CanvasContext.update_color(canvas_id, color_id, Map.delete(params, ["canvas_id", "color_id"])) do
      {:ok, color} ->
        json(conn, %{color: ColorSerializer.serialize_color(color)})

      {:error, :not_found} ->
        send_resp(conn, 404, "color.not_found")

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
