defmodule Backend.Canvas.Pixel do
  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: []}
  schema "pixels" do
    belongs_to :canvas, Backend.Canvas.Canvas, foreign_key: :canvas_id, type: :binary_id
    belongs_to :color, Backend.Canvas.Color, type: :binary_id
    belongs_to :user, Backend.Accounts.User, type: :binary_id
    has_many :pixel_history, Backend.Canvas.PixelHistory, foreign_key: :pixel_id

    field :x, :integer
    field :y, :integer

    timestamps(type: :utc_datetime)
  end
end
