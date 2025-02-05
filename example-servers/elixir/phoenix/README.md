# DeepChatPhoenixLw

This is an example Phoenix [LiveView](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html) template that can be used to communicate with the [Deep Chat](https://www.npmjs.com/package/deep-chat) component. It includes custom endpoints that can be used to host your own service.

To start your Phoenix server:

- Run `mix setup` to install and setup dependencies
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`
- A database is required to run the application. The default configuration is located at `config/dev.exs` and uses a local PostgreSQL database. You can run a local PostgreSQL database using a locally installed package, or a container image:
  - ` podman run --name deep_chat_phoenix_lw_dev -p 5432:5432 -dit -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres docker.io/postgres:17-alpine`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Key Changes done

### Client:

- Assigns coming from the socket need to be encoded to JSON.
- DeepChat methods can be called from the server by pushing an event to the client. Note the `Phoenix.LiveView.push_event` function, and the handler located at `app.js`.

### Server Sent Events:

- `Plug.Conn.send_chunked` and `Plug.Conn.chunk` are the relevant functions to implement SSE.
- If using nginx, disable buffering using `put_resp_header("x-accel-buffering", "no")`
- Mime type configuration is required. The following has been added in `config.exs`

```
config :mime, :types, %{
  "text/event-stream" => ["sse"]
}
```

- `sse` added to plug accepts: `plug :accepts, ["json", "sse"]`

### File support:

Multi-file upload requires a new Plug parser to be written (as `Plug.Parsers.MULTIPART` will not parse multiple parts that share the same name, and this is the standard behavior of FormData multiple). Alternatively, DeepChat interceptor could be used to modify the request, a new plug is preferred. Plug code by https://github.com/ndrean
Moved Plug.Parsers configuration from `endpoint.ex` into `router.ex` so that they can be defined in route pipelines.

## Learn more

- Official website: https://www.phoenixframework.org/
- Guides: https://hexdocs.pm/phoenix/overview.html
- Docs: https://hexdocs.pm/phoenix
- Forum: https://elixirforum.com/c/phoenix-forum
- Source: https://github.com/phoenixframework/phoenix
