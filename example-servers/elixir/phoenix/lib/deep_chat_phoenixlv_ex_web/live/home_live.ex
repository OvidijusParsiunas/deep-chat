defmodule DeepChatPhoenixlvExWeb.HomeLive do
  use DeepChatPhoenixlvExWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    history = [
      %{role: "user", text: "Hey, how are you today?"},
      %{role: "ai", text: "I am doing very well!"}
    ]

    {:ok,
     socket
     |> assign(:history, history)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="chat-container">
      <h1 class="chat-title">Deep Chat</h1>
      <button phx-click="clear_messages" class="clear-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 clear-button-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
      <div class="chat-wrapper">
        <deep-chat
          id="deepchat-main"
          connect={Jason.encode!(%{url: "/api/chat-stream", method: "POST", stream: true})}
          mixedFiles={Jason.encode!(%{connect: %{url: "/api/files", method: "POST", stream: true}})}
          history={Jason.encode!(@history)}
          textInput={Jason.encode!(%{placeholder: %{text: "Welcome to the demo!"}})}
          style="width: 100%; height: 400px; border-radius: 10px; border: 2px solid #d1d5dc; font-size: 0.9rem; font-family: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
        >
        </deep-chat>
      </div>
    </div>
    """
  end

  # Clear messages handler. App.js includes the javascript event listener for the event.
  @impl true
  def handle_event("clear_messages", _params, socket) do
    {:noreply,
     push_event(socket, "exec", %{
       id: "deepchat-main",
       function: "clearMessages"
     })}
  end
end
