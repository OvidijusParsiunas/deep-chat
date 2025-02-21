defmodule DeepChatPhoenixlvExWeb.Router do
  use DeepChatPhoenixlvExWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {DeepChatPhoenixlvExWeb.Layouts, :root}
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
      parsers: [:urlencoded, DeepChatPhoenixlvExWeb.FdMultipart, :json],
      pass: ["*/*"],
      json_decoder: Phoenix.json_library(),
      multipart_to_params: {DeepChatPhoenixlvExWeb.FdMultipart, :multipart_to_params, []},
      body_reader: {DeepChatPhoenixlvExWeb.FdMultipart, :read_body, []}
  end

  scope "/", DeepChatPhoenixlvExWeb do
    pipe_through :browser

    live_session :main do
      live "/", HomeLive, :index
    end
  end

  # Other scopes may use custom stacks.
  scope "/api", DeepChatPhoenixlvExWeb do
    pipe_through :api

    post "/chat-stream", ChatController, :chat_stream
    post "/chat", ChatController, :chat
  end

  scope "/api", DeepChatPhoenixlvExWeb do
    pipe_through :api_custom_fd

    post "/files", ChatController, :files
  end

  # Other scopes may use custom stacks.
  # scope "/api", DeepChatPhoenixlvExWeb do
  #   pipe_through :api
  # end
end
