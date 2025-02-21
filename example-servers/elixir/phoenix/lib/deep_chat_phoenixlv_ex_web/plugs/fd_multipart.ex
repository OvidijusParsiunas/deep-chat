defmodule DeepChatPhoenixlvExWeb.FdMultipart do
  @multipart Plug.Parsers.MULTIPART

  @moduledoc """
  Custom multipart parser to enable multiple files upload.

  It generates a unique key for each file input.

  Credit to ndrean https://github.com/ndrean
  """
  @spec init(any) :: any
  def init(opts) do
    opts
  end

  def parse(conn, "multipart", subtype, headers, opts) do
    length =
      case System.fetch_env("UPLOAD_LIMIT") do
        {:ok, value} -> String.to_integer(value)
        # 10MB default
        :error -> 10_000_000
      end

    opts = @multipart.init([length: length] ++ opts)
    @multipart.parse(conn, "multipart", subtype, headers, opts)
  end

  def parse(conn, _type, _subtype, _headers, _opts) do
    {:next, conn}
  end

  def multipart_to_params(parts, conn) do
    case filter_content_type(parts) do
      nil ->
        # do nothing if no files
        {:ok, %{}, conn}

      new_parts ->
        acc =
          for {name, _headers, body} <- Enum.reverse(new_parts),
              reduce: Plug.Conn.Query.decode_init() do
            acc -> Plug.Conn.Query.decode_each({name, body}, acc)
          end

        {:ok, Plug.Conn.Query.decode_done(acc, []), conn}
    end
  end

  @doc """
  Rebuilds the "content-type" sublist of "parts" by indexing the key.

  When it captures an entry with header "content-type", a new key will be assigned
  """
  def filter_content_type(parts) when is_list(parts) do
    filtered =
      parts
      |> Enum.filter(fn
        {_, [{"content-type", _}, {"content-disposition", _}], %Plug.Upload{}} = part ->
          part

        {_, [_], _} ->
          nil
      end)

    l = length(filtered)

    case l do
      0 ->
        nil

      _ ->
        others = Enum.filter(parts, fn elt -> !Enum.member?(filtered, elt) end)

        # get the initial key
        key = filtered |> hd() |> elem(0)
        # build a list of new keys, indexed.
        new_keys = Enum.map(1..l, fn i -> key <> "#{i}" end)

        # exchange the key to a new key
        f =
          Enum.zip_reduce([filtered, new_keys], [], fn elts, acc ->
            [{_, headers, content}, new_key] = elts
            [{new_key, headers, content} | acc]
          end)

        f ++ others
    end
  end
end
