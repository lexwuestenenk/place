defmodule BackendWeb.Serializers.Color do
  def serialize_colors(colors) do
    Enum.map(colors, &serialize_color/1)
  end

  def serialize_color(color) do
    %{
      id: color.id,
      hex: color.hex,
      index: color.index,
    }
  end
end
