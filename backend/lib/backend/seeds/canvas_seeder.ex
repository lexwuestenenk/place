defmodule Backend.Seeds.CanvasSeeder do
  alias Backend.Repo
  alias Backend.Canvas.{Canvas, Color}

  @color_palettes [
    [
      "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF",
      "00FFFF", "800000", "808000", "008000", "800080",
      "008080", "000080", "FFA500", "A52A2A", "7FFF00",
      "D2691E", "5F9EA0", "D2691E", "6495ED", "DC143C",
      "00CED1", "9400D3", "FF1493", "FFD700", "ADFF2F",
      "4B0082", "F08080", "20B2AA", "87CEFA", "778899",
      "32CD32", "66CDAA", "BA55D3", "9370DB", "3CB371",
      "7B68EE", "48D1CC", "C71585", "6A5ACD", "708090",
      "00FA9A", "BDB76B", "E9967A", "8FBC8F", "483D8B",
      "FF4500", "DA70D6", "EEE8AA", "CD853F", "B22222"
    ],
    ["4b70da", "d14ff7", "ffc857", "2a9d8f", "e76f51"],
    ["1f1f1f", "f1f1f1", "ff5722", "03a9f4", "8bc34a"]
  ]

  def seed_canvases_with_colors do
    Enum.each(1..3, fn i ->
      canvas_attrs = %{
        name: "Canvas ##{i}",
        width: 100 * i,
        height: 100 * (i * 2),
        cooldown: 10
      }

      canvas_changeset = Canvas.create_changeset(%Canvas{}, canvas_attrs)

      case Repo.insert(canvas_changeset) do
        {:ok, canvas} ->
          IO.puts("✅ Created canvas #{canvas.name}")

          Enum.with_index(Enum.at(@color_palettes, i - 1))
          |> Enum.each(fn {hex, index} ->
            color_attrs = %{
              canvas_id: canvas.id,
              hex: hex,
              index: index
            }

            color_changeset = Color.create_changeset(%Color{}, color_attrs)

            case Repo.insert(color_changeset) do
              {:ok, color} ->
                IO.puts("  🎨 Added color ##{index + 1} (#{color.hex})")

              {:error, changeset} ->
                IO.inspect(changeset.errors, label: "❌ Failed to insert color")
            end
          end)

        {:error, changeset} ->
          IO.inspect(changeset.errors, label: "❌ Failed to insert canvas")
      end
    end)
  end
end
