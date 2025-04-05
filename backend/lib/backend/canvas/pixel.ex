defmodule Backend.Canvas.Pixel do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: []}
  schema "pixels" do
    belongs_to :canvas, Backend.Canvas.Canvas, foreign_key: :canvas_id, type: :binary_id
    belongs_to :color, Backend.Canvas.Color, foreign_key: :color_id, type: :binary_id
    belongs_to :user, Backend.Accounts.User, foreign_key: :user_id, type: :binary_id
    has_many :pixel_histories, Backend.Canvas.PixelHistory, foreign_key: :pixel_id

    field :x, :integer
    field :y, :integer

    timestamps(type: :utc_datetime)
  end

  def create_changeset(pixel, attrs, canvas) do
    pixel
    |> cast(attrs, [:canvas_id, :color_id, :user_id, :x, :y])
    |> validate_required([:canvas_id, :color_id, :user_id, :x, :y])
    |> validate_number(:x, greater_than_or_equal_to: 0, less_than_or_equal_to: (canvas.width - 1))
    |> validate_number(:y, greater_than_or_equal_to: 0, less_than_or_equal_to: (canvas.width - 1))
  end

  def update_changeset(pixel, attrs) do
    pixel
    |> cast(attrs, [:color_id, :user_id])
    |> validate_required([:color_id, :user_id])
  end
end
