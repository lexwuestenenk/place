defmodule BackendWeb.Plugs.RequireAdmin do
  import Plug.Conn
  import Phoenix.Controller

  def init(opts), do: opts

  def call(%Plug.Conn{assigns: %{current_user: %{role: "user"}}} = conn, _opts), do: conn

  def call(conn, _opts) do
    conn
    |> put_status(:forbidden)
    |> json(%{error: "forbidden"})
    |> halt()
  end
end
