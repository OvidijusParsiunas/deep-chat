package com.server.utils.deepChat;

public class DeepChatRequestBody {
  private DeepChatRequestMessage[] messages;
  private String model;
  private Boolean stream;

  public DeepChatRequestMessage[] getMessages() {
    return this.messages;
  }

  public String getModel() {
    return this.model;
  }

  public Boolean getStream() {
    return this.stream;
  }
}
