package com.server.basic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.server.utils.deepChat.DeepChatRequestBody;
import com.server.utils.deepChat.DeepChatTextRespose;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

@RestController
public class BasicController {

  @Autowired
  private BasicService basicService;

  @PostMapping("/chat")
  public DeepChatTextRespose chat(@RequestBody DeepChatRequestBody requestBody) {
    return this.basicService.chat(requestBody);
  }

  @PostMapping("/chat-stream")
  public void chatStream(@RequestBody DeepChatRequestBody requestBody, HttpServletResponse response) throws IOException {
    this.basicService.chatStream(requestBody, response);
  }

  @PostMapping("/files")
  public DeepChatTextRespose files(
      @RequestPart("files") List<MultipartFile> files,
      @RequestParam Map<String, String> formDataProperties) throws IOException {
    return this.basicService.files(files, formDataProperties);
  }
}
