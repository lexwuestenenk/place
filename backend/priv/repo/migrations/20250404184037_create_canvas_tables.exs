defmodule Elixir.Backend.Repo.Migrations.CreateCanvasTables do
  use Ecto.Migration

  def change do
    create table(:canvases, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :width, :integer, null: false
      add :height, :integer, null: false
      add :cooldown, :integer, null: false, default: 180

      timestamps(type: :utc_datetime)
    end

    create table(:colors, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :hex, :string, null: false
      add :index, :integer, null: false

      add :canvas_id, references(:canvases, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create table(:pixels, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :x, :integer, null: false
      add :y, :integer, null: :false

      add :canvas_id, references(:canvases, type: :binary_id, on_delete: :delete_all), null: false
      add :color_id, references(:colors, type: :binary_id, on_delete: :restrict), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :nothing), null: false

      timestamps(type: :utc_datetime)
    end

    create table(:pixels_history, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :pixel_id, references(:pixels, type: :binary_id, on_delete: :delete_all), null: false
      add :color_id, references(:colors, type: :binary_id, on_delete: :restrict), null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :nothing), null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:pixels, [:canvas_id, :x, :y])
  end
end
