use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :auth, Auth.Endpoint,
  secret_key_base: "S/LswuuzQoKoObWSloFItL94WAe+4VBR/s2AVBeIDb16z5BqYSTtMw+f1YnBXSws"

# Configure your database
config :auth, Auth.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "auth_prod",
  pool_size: 20
