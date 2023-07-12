package com.server.utils.deepChat;

public class OpenAIChatResult {
  private OpenAIChatResultChoice[] choices;
  private OpenAIError error;

  public OpenAIChatResultChoice[] getChoices() {
    return this.choices;
  }

  public OpenAIError getError() {
    return this.error;
  }
}
