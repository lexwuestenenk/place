defmodule BackendWeb.Serializers.PixelHistory do
  def serialize_pixel_histories(pixel_histories) do
    Enum.map(pixel_histories, &serialize_pixel_histories_with_relations/1)
  end

  def serialize_pixel_histories_with_relations(pixel_history) do
    %{
      color:
        %{
          id: pixel_history.color.id,
          hex: pixel_history.color.hex,
          index: pixel_history.color.index
        },
      pixel:
        %{
          id: pixel_history.pixel.id,
          x: pixel_history.pixel.x,
          y: pixel_history.pixel.y,
        },
      user:
        %{
          id: pixel_history.user.id,
          username: pixel_history.user.username
        },
      inserted_at: pixel_history.inserted_at,
    }
  end
end
