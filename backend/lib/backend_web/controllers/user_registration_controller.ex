defmodule BackendWeb.UserRegistrationController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Accounts.User

  def create(conn, %{"user" => user_params}) do
    case Accounts.register_user(user_params) do
      {:ok, %User{} = user} ->
        conn
        |> put_status(:created)
        |> json(%{message: "register_success", user: user})

      {:error, changeset} ->
        errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
          Enum.reduce(opts, msg, fn {key, value}, acc ->
            String.replace(acc, "%{#{key}}", to_string(value))
          end)
        end)

        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: errors})
    end
  end
end
