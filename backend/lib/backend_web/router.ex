defmodule BackendWeb.Router do
  use BackendWeb, :router
  import BackendWeb.UserAuth

  alias BackendWeb.Plugs.RequireAdmin

  # Define only the API pipeline
  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :authenticated do
    plug :fetch_api_user
  end

  pipeline :admin do
    plug RequireAdmin
  end

  # API Routes
  # Unprotected
  scope "/api", BackendWeb do
    pipe_through :api

    post "/users/login", UserSessionController, :create
    post "/users/register", UserRegistrationController, :create
  end

  # Protected
  scope "/api", BackendWeb do
    pipe_through [:api, :authenticated]

    get "/canvases", CanvasController, :index
    get "/canvases/:canvas_id", CanvasController, :show
    post "/canvases", CanvasController, :create
    patch "/canvases/:canvas_id", CanvasController, :update
  end

  scope "/api", BackendWeb do
    pipe_through [:api, :authenticated, :admin]

    post "/canvases/:canvas_id/colors", ColorController, :create
    get "/canvases/:canvas_id/colors", ColorController, :index
    patch "/canvases/:canvas_id/colors/:color_id", ColorController, :update
  end
end
