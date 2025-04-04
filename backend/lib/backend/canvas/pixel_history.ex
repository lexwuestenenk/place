defmodule Backend.Canvas.PixelHistory do
  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: []}
  schema "pixels_history" do
    belongs_to :pixel, Backend.Canvas.Pixel, type: :binary_id
    belongs_to :color, Backend.Canvas.Color, type: :binary_id
    belongs_to :user, Backend.Accounts.User, type: :binary_id

    timestamps(type: :utc_datetime)
  end
end
