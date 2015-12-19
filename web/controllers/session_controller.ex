import Joken

defmodule Auth.SessionController do
  use Auth.Web, :controller

  def new(conn, _params) do
    render conn, "new.html"
  end

def create(conn, %{"session" => session_params}) do
  case Auth.Session.login(session_params, Auth.Repo) do
    {:ok, user} ->
      my_token = %{user_id: user.email}
      |> token
      |> with_validation("user_id", &(&1 == 1))
      |> with_signer(hs256("53F61451CAD6231FDCF6859C6D5B88C1EBD5DC38B9F7EBD990FADD4EB8EB9063"))
      |> sign
      |> get_compact

      conn
      |> put_session(:token, my_token)
      |> put_session(:current_user, user.id)
      |> put_session(:current_email, user.email)
      |> put_flash(:info, "Logged in")
      |> redirect(to: "/")
    :error ->
      conn
      |> put_flash(:info, "Wrong email or password")
      |> render("new.html")
  end
end

def delete(conn, _) do
  conn
  |> delete_session(:current_user)
  |> put_flash(:info, "Logged out")
  |> redirect(to: "/")
end

end
