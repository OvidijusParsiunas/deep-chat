package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StabilityAITextToImageBody {
  @JsonProperty("text_prompts")
  private StabilityAIPromptText[] textPrompts;

  public StabilityAITextToImageBody(String text) {
    this.textPrompts = new StabilityAIPromptText[]{new StabilityAIPromptText(text)};
  }

  public StabilityAIPromptText[] getTextPrompts() {
    return this.textPrompts;
  }
}
