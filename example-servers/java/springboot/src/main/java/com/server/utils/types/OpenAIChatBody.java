package com.server.utils.types;

public class OpenAIChatBody {
  private OpenAIChatMessage[] messages;
  private String model;
  private Boolean stream;

  public OpenAIChatBody(OpenAIChatMessage[] messages, String model, Boolean stream) {
    this.messages = messages;
    this.model = model;
    if (stream) this.stream = stream;
  }

  public OpenAIChatMessage[] getMessages() {
    return this.messages;
  }

  public String getModel() {
    return this.model;
  }

  public Boolean getStream() {
    return this.stream;
  }
}
