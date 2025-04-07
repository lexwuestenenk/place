defmodule BackendWeb.Serializers.Pixel do
  def serialize_pixels(pixels) do
    Enum.map(pixels, &serialize_pixel_with_relations/1)
  end

  def serialize_pixel_with_color_and_user(pixel) do
    %{
      id: pixel.id,
      x: pixel.x,
      y: pixel.y,
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
    }
  end

  def serialize_pixel_with_relations(pixel) do
    %{
      id: pixel.id,
      x: pixel.x,
      y: pixel.y,
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
    }
  end
end
