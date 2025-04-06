defmodule Mix.Tasks.CreateSuperuser do
  use Mix.Task

  @shortdoc "Creates a superuser (admin)"

  def run(_) do
    # Start the app and dependencies, since this is a standalone task
    Mix.Task.run("app.start")

    # Prompt for email and password
    email = prompt("Email")
    username = prompt("Username")
    password = prompt("Password")

    attrs = %{
      "email" => email,
      "username" => username,
      "password" => password,
      "confirm_password" => password,
      "role" => "admin"
    }

    case Backend.Accounts.register_user(attrs) do
      {:ok, user} ->
        Mix.shell().info("✅ Superuser created: #{user.email}")
      {:error, changeset} ->
        IO.inspect(Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
          Enum.reduce(opts, msg, fn {key, value}, acc ->
            String.replace(acc, "%{#{key}}", inspect(value))
          end)
        end), label: "❌ Failed to create superuser")
    end
  end

  defp prompt(field) do
    IO.gets("#{field}: ") |> String.trim()
  end
end
