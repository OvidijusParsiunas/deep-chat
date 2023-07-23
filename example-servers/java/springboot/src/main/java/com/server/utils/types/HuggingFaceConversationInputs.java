package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HuggingFaceConversationInputs {
  @JsonProperty("past_user_inputs")
  private String[] pastUserInputs;
  @JsonProperty("generated_responses")
  private String[] generatedResponses;
  private String text;

  public HuggingFaceConversationInputs(String[] pastUserInputs, String[] generatedResponses, String text) {
    this.pastUserInputs = pastUserInputs;
    this.generatedResponses = generatedResponses;
    this.text = text;
  }

  public String[] getPastUserInputs() {
    return this.pastUserInputs;
  }

  public String[] getGeneratedResponses() {
    return this.generatedResponses;
  }

  public String getText() {
    return this.text;
  }
}
