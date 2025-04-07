defmodule BackendWeb.Serializers.Canvas do
  def serialize_canvases(canvases) do
    Enum.map(canvases, &serialize_canvas_with_colors/1)
  end

  def serialize_canvas(canvas) do
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

  def serialize_canvas_with_colors(canvas) do
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

  def serialize_canvas_with_relations(canvas) do
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
          color: %{
            id: pixel.color.id,
            hex: pixel.color.hex,
            index: pixel.color.index
          },
          user_id: pixel.user_id
        }
      end)
    }
  end
end
