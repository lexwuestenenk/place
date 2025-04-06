defmodule Backend.Canvas do
  import Ecto.Query

  alias Backend.Repo
  alias BackendWeb.CanvasChannel
  alias Backend.Canvas.{Canvas, Color, Pixel}

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
      canvas -> canvas |> Canvas.update_changeset(attrs) |> Repo.update()
    end
  end

  # Canvas -> colors
  def list_colors(canvas_id) do
    from(c in Color, where: c.canvas_id == ^canvas_id)
    |> Repo.all()
  end

  def create_color(canvas_id, hex, index) do
    %Color{}
    |> Color.create_changeset(%{
      canvas_id: canvas_id,
      hex: hex,
      index: index
    })
    |> Repo.insert()
  end

  def update_color(canvas_id, color_id, attrs) do
    case Repo.get_by(Color, [id: color_id, canvas_id: canvas_id]) do
      nil -> {:error, :not_found}
      color -> color |> Color.update_changeset(attrs) |> Repo.update()
    end
  end

  # Canvas -> pixels
  def list_pixels(canvas_id) do
    from(p in Pixel, where: p.canvas_id == ^canvas_id)
    |> Repo.all()
    |> Repo.preload([:canvas, :color, :user])
  end

  def upsert_pixel_by_position(canvas_id, x, y, attrs) do
    case Repo.get_by(Pixel, [canvas_id: canvas_id, x: x, y: y]) do
      nil ->
        case Repo.get(Canvas, canvas_id) do
          nil -> {:error, :canvas_not_found}
          canvas ->
            changeset = Pixel.create_changeset(%Pixel{}, Map.merge(attrs, %{"x" => x, "y" => y}), canvas)
            case Repo.insert(changeset) do
              {:ok, pixel} ->
                CanvasChannel.send_pixel(canvas_id, pixel)
                {:ok, pixel}

              error -> error
            end
        end

      pixel ->
        changeset = Pixel.update_changeset(pixel, attrs)
        case Repo.update(changeset) do
          {:ok, updated_pixel} ->
            CanvasChannel.send_pixel(canvas_id, updated_pixel)
            {:ok, updated_pixel}

          error -> error
        end
    end
  end

  def update_pixel_by_id(pixel_id, attrs) do
    case Repo.get(Pixel, pixel_id) do
      nil -> {:error, :not_found}
      color -> color |> Color.update_changeset(attrs) |> Repo.update()
    end
  end
end
