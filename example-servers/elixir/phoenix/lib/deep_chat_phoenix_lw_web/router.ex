defmodule DeepChatPhoenixLwWeb.Router do
  use DeepChatPhoenixLwWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {DeepChatPhoenixLwWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json", "sse"]

    plug Plug.Parsers,
      parsers: [:urlencoded, :multipart, :json],
      pass: ["*/*"],
      json_decoder: Phoenix.json_library()
  end

  pipeline :api_custom_fd do
    plug :accepts, ["json", "sse"]

    plug Plug.Parsers,
      parsers: [:urlencoded, DeepChatPhoenixLwWeb.FdMultipart, :json],
      pass: ["*/*"],
      json_decoder: Phoenix.json_library(),
      multipart_to_params: {DeepChatPhoenixLwWeb.FdMultipart, :multipart_to_params, []},
      body_reader: {DeepChatPhoenixLwWeb.FdMultipart, :read_body, []}
  end

  scope "/", DeepChatPhoenixLwWeb do
    pipe_through :browser

    live_session :main do
      live "/", HomeLive, :index
    end
  end

  # Other scopes may use custom stacks.
  scope "/api", DeepChatPhoenixLwWeb do
    pipe_through :api

    post "/chat-stream", ChatController, :chat_stream
    post "/chat", ChatController, :chat
  end

  scope "/api", DeepChatPhoenixLwWeb do
    pipe_through :api_custom_fd

    post "/files", ChatController, :files
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:deep_chat_phoenix_lw, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: DeepChatPhoenixLwWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
