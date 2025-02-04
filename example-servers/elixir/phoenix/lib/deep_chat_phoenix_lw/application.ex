defmodule DeepChatPhoenixLw.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      DeepChatPhoenixLwWeb.Telemetry,
      DeepChatPhoenixLw.Repo,
      {DNSCluster, query: Application.get_env(:deep_chat_phoenix_lw, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: DeepChatPhoenixLw.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: DeepChatPhoenixLw.Finch},
      # Start a worker by calling: DeepChatPhoenixLw.Worker.start_link(arg)
      # {DeepChatPhoenixLw.Worker, arg},
      # Start to serve requests, typically the last entry
      DeepChatPhoenixLwWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: DeepChatPhoenixLw.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    DeepChatPhoenixLwWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
