defmodule BackendWeb.ColorController do
  use BackendWeb, :controller

  alias Backend.Canvas, as: CanvasContext

  def index(conn, %{"canvas_id" => canvas_id}) do
    colors = CanvasContext.list_colors(canvas_id)
    json(conn, %{data: serialize_colors(colors)})
  end

  def create(conn, %{
    "canvas_id" => canvas_id,
    "hex" => hex,
    "index" => index,
  }) do
    case CanvasContext.create_color(canvas_id, hex, index) do
      {:ok, color} -> json(conn, %{color: serialize_color(color)})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end

  def update(conn, %{"canvas_id" => canvas_id, "color_id" => color_id} = params) do
    case CanvasContext.update_color(canvas_id, color_id, Map.delete(params, ["canvas_id", "color_id"])) do
      {:ok, color} ->
        json(conn, %{canvas: serialize_color(color)})

      {:error, :not_found} ->
        send_resp(conn, 404, "color.not_found")

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: translate_errors(changeset)})
    end
  end

  defp serialize_colors(colors) do
    Enum.map(colors, &serialize_color/1)
  end

  defp serialize_color(color) do
    %{
      id: color.id,
      hex: color.hex,
      index: color.index,
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
