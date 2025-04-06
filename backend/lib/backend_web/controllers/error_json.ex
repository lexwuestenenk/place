defmodule BackendWeb.ErrorJSON do
  use BackendWeb, :controller

  def render("404.json", _assigns) do
    %{error: "Not found"}
  end

  def render("500.json", _assigns) do
    %{error: "Internal server error"}
  end

  # Optionally, fallback for all unhandled templates
  def template_not_found(template, _assigns) do
    %{error: Phoenix.Controller.status_message_from_template(template)}
  end
end
