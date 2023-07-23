package com.server.utils.types;

public class DeepChatTextResponseMessage {
  private String text;

  public DeepChatTextResponseMessage(String text) {
    if (text != null) {
      this.text = text;
    }
  }

  public String getText() {
    return text;
  }
}