package com.server.utils.types;

public class CohereChatMessageHistory {
  private String userName;
  private String text;

  public CohereChatMessageHistory(String role, String text) {
    this.userName = role.equals("assistant") ? "CHATBOT" : "USER";
    this.text = text;
  }

  public String getUserName() {
    return this.userName;
  }

  public String getText() {
    return this.text;
  }
}
