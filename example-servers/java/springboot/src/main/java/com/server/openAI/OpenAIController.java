package com.server.openAI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.server.utils.types.DeepChatFileResponse;
import com.server.utils.types.DeepChatRequestBody;
import com.server.utils.types.DeepChatTextRespose;
import reactor.core.publisher.Flux;
import java.util.List;

// Make sure to set the OPENAI_API_KEY environment variable in application.properties

@RestController
public class OpenAIController {
  @Autowired
  private OpenAIService openAIService;

  @PostMapping("/openai-chat")
  public DeepChatTextRespose chat(@RequestBody DeepChatRequestBody requestBody) throws Exception {
    return this.openAIService.chat(requestBody);
  }

  @PostMapping("/openai-chat-stream")
  public Flux<DeepChatTextRespose> chatStream(@RequestBody DeepChatRequestBody requestBody) {
    return this.openAIService.chatStream(requestBody);
  }

  @PostMapping("/openai-image")
  public DeepChatFileResponse files(@RequestPart("files") List<MultipartFile> files) throws Exception {
    return this.openAIService.imageVariation(files);
  }
}
