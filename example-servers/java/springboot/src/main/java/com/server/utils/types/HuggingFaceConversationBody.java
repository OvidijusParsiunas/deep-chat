package com.server.utils.types;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HuggingFaceConversationBody {
  private HuggingFaceConversationInputs inputs;
  @JsonProperty("wait_for_model")
  private Boolean waitForModel;

  public HuggingFaceConversationBody(HuggingFaceConversationInputs inputs, Boolean waitForModel) {
    this.inputs = inputs;
    this.waitForModel = waitForModel;
  }

  public HuggingFaceConversationInputs getInputs() {
    return this.inputs;
  }

  public Boolean getWaitForModel() {
    return this.waitForModel;
  }
}
