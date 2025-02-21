defmodule DeepChatPhoenixlvExWeb.ChatController do
  use DeepChatPhoenixlvExWeb, :controller

  def chat_stream(conn, _params) do
    conn
    |> put_resp_content_type("text/event-stream")
    |> put_resp_header("cache-control", "no-cache")
    |> put_resp_header("Connection", "keep-alive")
    # Disable nginx buffering
    |> put_resp_header("x-accel-buffering", "no")
    |> send_chunked(200)
    |> stream_response(
      ~w(This is a response from a Phoenix server using SSE. Thank you for your message!)
    )
  end

  defp stream_response(conn, responseStrChunks) do
    messageRequestBody = conn.body_params

    IO.inspect(messageRequestBody)

    responseChunks =
      responseStrChunks
      |> Enum.map(fn word ->
        "data: " <>
          Jason.encode!(%{
            text: word <> " "
          }) <> "\n\n"
      end)

    Enum.reduce_while(responseChunks, conn, fn chunk, conn ->
      case Plug.Conn.chunk(conn, chunk) do
        {:ok, conn} ->
          {:cont, conn}

        {:error, :closed} ->
          {:halt, conn}
      end
    end)
  end

  def chat(conn, _params) do
    messageRequestBody = conn.body_params

    IO.inspect(messageRequestBody)

    response = "This is a response from a Phoenix server using JSON. Thank you for your message!"

    conn
    |> put_status(200)
    |> json(%{text: response})
  end

  def files(conn, params) do
    # Files are stored inside a form using Deep Chat request FormData format:
    # https://deepchat.dev/docs/connect
    IO.inspect(params)

    if map_size(params) > 0 do
      Enum.each(params, fn {key, value} ->
        cond do
          String.contains?(key, "files") -> IO.inspect(value, label: "Received file")
          String.contains?(key, "messages") -> IO.inspect(value, label: "Received text")
          true -> nil
        end
      end)

      conn
      |> put_resp_content_type("text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("Connection", "keep-alive")
      # Disable nginx buffering
      |> put_resp_header("x-accel-buffering", "no")
      |> send_chunked(200)
      |> stream_response(~w(Received files and/or messages))
    else
      conn
      |> put_resp_content_type("text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("Connection", "keep-alive")
      # Disable nginx buffering
      |> put_resp_header("x-accel-buffering", "no")
      |> send_chunked(400)
      |> stream_response(~w(No data received))
    end
  end
end
