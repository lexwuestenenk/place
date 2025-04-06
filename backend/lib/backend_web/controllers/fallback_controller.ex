defmodule BackendWeb.FallbackController do
  use BackendWeb, :controller

  # Not found
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> json(%{error: "Resource not found"})
  end

  # Validation error from changeset
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", inspect(value))
      end)
    end)

    conn
    |> put_status(:unprocessable_entity)
    |> json(%{errors: errors})
  end

  def call(conn, {:error, reason}) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: inspect(reason)})
  end
end
