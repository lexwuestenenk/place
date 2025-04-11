defmodule BackendWeb.UserController do
  use BackendWeb, :controller

  alias Backend.Repo
  alias Backend.Accounts.User

  def show_self(conn, _params) do
    user = conn.assigns.current_user
    json(conn, %{user: user})
  end

  def show(conn, %{"user_id" => user_id}) do
      case Repo.get(Backend.Accounts.User, user_id) do
        nil ->
          conn
          |> put_status(:not_found)
          |> json(%{error: "user.not_found"})

        user ->
          json(conn, %{user: user})
    end
  end
end
