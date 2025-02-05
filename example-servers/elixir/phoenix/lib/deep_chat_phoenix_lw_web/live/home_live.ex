defmodule DeepChatPhoenixLwWeb.HomeLive do
  use DeepChatPhoenixLwWeb, :live_view

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
    <div class="flex flex-col items-center justify-center gap-4 max-w-prose">
      <h1 class="text-4xl font-bold">Deep Chat</h1>
      <button
        phx-click="clear_messages"
        class="bg-zinc-900 hover:bg-zinc-700 p-2 rounded-lg flex items-center self-end"
      >
        <.icon name="hero-arrow-path" class="w-4 h-4 text-white" />
      </button>
      <div class="flex w-full">
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
