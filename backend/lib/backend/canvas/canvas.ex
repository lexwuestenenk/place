defmodule Backend.Canvas.Canvas do
  use Ecto.Schema
  import Ecto.Changeset


  @primary_key {:id, :binary_id, autogenerate: true}
  schema "canvases" do
    field :name, :string
    field :width, :integer
    field :height, :integer
    field :cooldown, :integer
    has_many :pixels, Backend.Canvas.Pixel, foreign_key: :canvas_id
    has_many :colors, Backend.Canvas.Color, foreign_key: :canvas_id

    timestamps(type: :utc_datetime)
  end

  def create_changeset(canvas, attrs) do
    canvas
    |> cast(attrs, [:name, :width, :height, :cooldown])
    |> validate_required([:name, :width, :height, :cooldown])
    |> validate_number(:width, greater_than: 0)
    |> validate_number(:height, greater_than: 0)
    |> validate_number(:cooldown, greater_than_or_equal_to: 1)
  end

  def update_changeset(canvas, attrs) do
    canvas
    |> cast(attrs, [:name, :width, :height, :cooldown])
    |> validate_number(:width, greater_than: 0)
    |> validate_number(:height, greater_than: 0)
    |> validate_number(:cooldown, greater_than_or_equal_to: 1)
  end
end
