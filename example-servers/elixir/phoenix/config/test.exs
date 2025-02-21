import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :deep_chat_phoenixlv_ex, DeepChatPhoenixlvExWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "hOG4XBcMcMlI5uj+i/BBnQmPOzJW15aSRFqnippwvk+Fh60eeD/LiYfJOp9m4yke",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# Enable helpful, but potentially expensive runtime checks
config :phoenix_live_view,
  enable_expensive_runtime_checks: true
