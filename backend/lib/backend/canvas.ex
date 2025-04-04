defmodule Backend.Canvas do
  import Ecto.Query

  alias Backend.Repo
  alias Backend.Canvas.Canvas
  alias Backend.Canvas.Color

  # Canvas
  def list_canvases() do
    Repo.all(Canvas)
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

  def edit_canvas(canvas_id, attrs) do
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

  def edit_color(canvas_id, color_id, attrs) do
    case Repo.get_by(Color, id: color_id, canvas_id: canvas_id) do
      nil -> {:error, :not_found}
      color -> color |> Color.update_changeset(attrs) |> Repo.update()
    end
  end
end
