package com.server.utils.deepChat;

public class DeepChatTextRespose {
  private DeepChatTextResponseMessage result;

  public DeepChatTextRespose(String text) {
    result = new DeepChatTextResponseMessage(text);
  }

  public DeepChatTextResponseMessage getResult() {
    return this.result;
  }
}