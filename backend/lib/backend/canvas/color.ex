defmodule Backend.Canvas.Color do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "colors" do
    belongs_to :canvas, Backend.Canvas.Canvas, foreign_key: :canvas_id, type: :binary_id
    has_many :pixels, Backend.Canvas.Pixel, foreign_key: :color_id

    field :hex, :string
    field :index, :integer

    timestamps(type: :utc_datetime)
  end

  def create_changeset(color, attrs) do
    color
    |> cast(attrs, [:canvas_id, :hex, :index])
    |> validate_required([:canvas_id, :hex, :index])
  end

  def update_changeset(color, attrs) do
    color
    |> cast(attrs, [:hex, :index])
    |> validate_required([:hex, :index])
  end
end
