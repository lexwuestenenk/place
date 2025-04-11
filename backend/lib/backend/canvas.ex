defmodule Backend.Canvas do
  import Ecto.Query

  alias Backend.Repo
  alias BackendWeb.CanvasChannel
  alias Backend.Canvas.{Canvas, Color, Pixel, PixelHistory}
  alias BackendWeb.Serializers.Pixel, as: PixelSerializer
  alias BackendWeb.Serializers.Canvas, as: CanvasSerializer

  # Canvas
  def list_canvases() do
    Repo.all(Canvas)
    |> Repo.preload(:colors)
  end

  def create_canvas(name, width, height, cooldown) do
    %Canvas{}
    |> Canvas.create_changeset(%{
      name: name,
      width: width,
      height: height,
      cooldown: cooldown
    })
    |> Repo.insert()
  end

  def update_canvas(canvas_id, attrs) do
    case Repo.get(Canvas, canvas_id) do
      nil -> {:error, :not_found}
      canvas ->
        changeset = Canvas.update_changeset(canvas, attrs)
        case Repo.update(changeset) do
          {:ok, updated_canvas} ->
            updated_canvas = Repo.preload(updated_canvas, [:colors])
            CanvasChannel.send_updated_canvas(CanvasSerializer.serialize_canvas_with_colors(updated_canvas))
            {:ok, updated_canvas}

            error -> error
        end
    end
  end

  # Canvas -> colors
  def list_colors(canvas_id) do
    from(c in Color, where: c.canvas_id == ^canvas_id)
    |> Repo.all()
  end

  def create_color(canvas_id, hex, index) do
    case Repo.get(Canvas, canvas_id) do
      nil ->
        {:error, :not_found}

      canvas ->
        case %Color{}
        |> Color.create_changeset(%{
          canvas_id: canvas_id,
          hex: hex,
          index: index
        })
        |> Repo.insert() do
          {:ok, color} ->
            canvas_with_colors = Repo.preload(canvas, [:colors])
            CanvasChannel.send_updated_canvas(CanvasSerializer.serialize_canvas_with_colors(canvas_with_colors))
            {:ok, color}

          error -> error
        end
    end
  end


  def update_color(canvas_id, color_id, attrs) do
    case Repo.get(Canvas, canvas_id) do
      nil ->
        {:error, :not_found}

      canvas ->
        case Repo.get_by(Color, [id: color_id, canvas_id: canvas_id]) do
          nil -> {:error, :not_found}
          color ->
            color |> Color.update_changeset(attrs) |> Repo.update()
            canvas_with_colors = Repo.preload(canvas, [:colors])
            CanvasChannel.send_updated_canvas(CanvasSerializer.serialize_canvas_with_colors(canvas_with_colors))
            {:ok, color}
        end
    end
  end

  # Canvas -> pixels
  def list_pixels(canvas_id) do
    from(p in Pixel, where: p.canvas_id == ^canvas_id)
    |> Repo.all()
    |> Repo.preload([:canvas, :color, :user])
  end

  def upsert_pixel_by_position(user, canvas_id, x, y, attrs) do
    case Repo.get_by(Pixel, [canvas_id: canvas_id, x: x, y: y]) do
      nil ->
        case Repo.get(Canvas, canvas_id) do
          nil -> {:error, :canvas_not_found}
          canvas ->
            changeset = Pixel.create_changeset(%Pixel{}, Map.merge(attrs, %{"x" => x, "y" => y}), canvas)
            case Repo.insert(changeset) do
              {:ok, updated_pixel} ->
                updated_pixel = Repo.preload(updated_pixel, [:color, :user])
                CanvasChannel.send_pixel(canvas_id, PixelSerializer.serialize_pixel_with_color_and_user(updated_pixel))
                {:ok, updated_pixel}

              error -> error
            end
        end

      pixel ->
        canvas = Repo.get!(Canvas, canvas_id)
        pixel = Repo.preload(pixel, :pixel_histories)

        latest_entry =
          pixel.pixel_histories
          |> Enum.filter(fn h -> h.user_id == user.id end)
          |> Enum.sort_by(& &1.inserted_at, {:desc, DateTime})
          |> List.first()

        if within_cooldown?(latest_entry, canvas.cooldown) do
          {:error, :cooldown_active}
        else
          Repo.insert!(%Backend.Canvas.PixelHistory{
            pixel_id: pixel.id,
            color_id: pixel.color_id,
            user_id: pixel.user_id
          })

          changeset = Pixel.update_changeset(pixel, attrs)

          case Repo.update(changeset) do
            {:ok, updated_pixel} ->
              updated_pixel = Repo.preload(updated_pixel, [:color, :user])
              CanvasChannel.send_pixel(canvas_id, PixelSerializer.serialize_pixel_with_color_and_user(updated_pixel))
              {:ok, updated_pixel}

            error -> error
          end
        end
    end
  end

  defp within_cooldown?(nil, _), do: false
  defp within_cooldown?(%{inserted_at: inserted_at}, cooldown_seconds) do
    DateTime.diff(DateTime.utc_now(), inserted_at) < cooldown_seconds
  end

  def list_pixel_histories(pixel_id) do
    from(ph in PixelHistory,
      where: ph.pixel_id == ^pixel_id,
      preload: [:pixel, :color, :user],
      order_by: [desc: ph.inserted_at]
    )
    |> Repo.all()
  end

  def update_pixel_by_id(pixel_id, attrs) do
    case Repo.get(Pixel, pixel_id) do
      nil -> {:error, :not_found}
      color -> color |> Color.update_changeset(attrs) |> Repo.update()
    end
  end
end
