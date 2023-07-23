package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HuggingFaceConversationResult {
  @JsonProperty("generated_text")
  private String generatedText;
  private String error;

  public String getGeneratedText() {
    return this.generatedText;
  }

    public String getError() {
    return this.error;
  }
}
