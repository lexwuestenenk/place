defmodule BackendWeb.UserSessionController do
  use BackendWeb, :controller

  alias Backend.Accounts

  def new(conn, _params) do
    render(conn, :new, error_message: nil)
  end

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    if user = Accounts.get_user_by_email_and_password(email, password) do
      token = Accounts.create_user_api_token(user)

      conn
      |> put_status(:ok)
      |> json(%{message: "login_success", token: token, user: user})

    else
      # In order to prevent user enumeration attacks, don't disclose whether the email is registered.
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "email_password_invalid"})
    end
  end

  def delete(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{message: "logout_success"})
  end
end
