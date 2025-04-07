defmodule Backend.Seeds.CanvasSeeder do
  alias Backend.Repo
  alias Backend.Canvas.{Canvas, Color}

  @color_palettes [
    ["FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF"],
    ["4b70da", "d14ff7", "ffc857", "2a9d8f", "e76f51"],
    ["1f1f1f", "f1f1f1", "ff5722", "03a9f4", "8bc34a"]
  ]

  def seed_canvases_with_colors do
    Enum.each(1..3, fn i ->
      canvas_attrs = %{
        name: "Canvas ##{i}",
        width: 100,
        height: 100,
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
