package com.server.cohere;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.server.utils.types.DeepChatRequestBody;
import com.server.utils.types.DeepChatTextRespose;

// Make sure to set the COHERE_API_KEY environment variable in application.properties

@RestController
public class CohereController {
  @Autowired
  private CohereService cohereService;

  @PostMapping("/cohere-chat")
  public DeepChatTextRespose chat(@RequestBody DeepChatRequestBody requestBody) throws Exception {
    return this.cohereService.chat(requestBody);
  }

  @PostMapping("/cohere-generate")
  public DeepChatTextRespose generateText(@RequestBody DeepChatRequestBody requestBody) throws Exception {
    return this.cohereService.generateText(requestBody);
  }

  @PostMapping("/cohere-summarize")
  public DeepChatTextRespose sumamrizeText(@RequestBody DeepChatRequestBody requestBody) throws Exception {
    return this.cohereService.summarizeText(requestBody);
  }
}
