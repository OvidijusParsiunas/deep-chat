package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CohereChatMessageHistory {
  @JsonProperty("user_name")
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
