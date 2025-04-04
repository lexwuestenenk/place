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

      {:error, _changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "email_password_duplicate"})
    end
  end
end
