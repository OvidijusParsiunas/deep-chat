package com.server.utils.types;

import java.util.List;

public class DeepChatFileResultMessage {
  private List<DeepChatFile> files;

  public DeepChatFileResultMessage(List<DeepChatFile> files) {
    if (files != null) {
      this.files = files;
    }
  }

  public List<DeepChatFile> getFiles() {
    return files;
  }
}