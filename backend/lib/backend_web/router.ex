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

    get "/users/me", UserController, :show_self

    get "/canvases", CanvasController, :index
    get "/canvases/:canvas_id", CanvasController, :show
    post "/canvases", CanvasController, :create
    patch "/canvases/:canvas_id", CanvasController, :update

    get "/canvases/:canvas_id/pixels", PixelController, :index
    get "/canvases/:canvas_id/pixels/:pixel_id", PixelController, :show
    get "/canvases/:canvas_id/pixels/:pixel_id/history", PixelHistoryController, :index
    patch "/canvases/:canvas_id/pixels", PixelController, :create_or_update

    get "/canvases/:canvas_id/colors", ColorController, :index
  end

  scope "/api", BackendWeb do
    pipe_through [:api, :authenticated, :admin]

    get "/users/:user_id", UserController, :show
    post "/canvases/:canvas_id/colors", ColorController, :create
    patch "/canvases/:canvas_id/colors/:color_id", ColorController, :update

    # Update pixel for moderators or something?
    # patch "/canvases/:canvas_id/pixels/:pixel_id", PixelController, :create_or_update
  end
end
