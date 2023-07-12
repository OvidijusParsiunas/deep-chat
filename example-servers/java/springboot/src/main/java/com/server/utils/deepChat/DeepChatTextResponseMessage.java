package com.server.utils.deepChat;

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