package com.server.huggingFace;

import com.server.utils.types.HuggingFaceConversationInputs;
import com.server.utils.types.HuggingFaceConversationResult;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.beans.factory.annotation.Value;
import com.server.utils.types.HuggingFaceConversationBody;
import com.server.utils.types.HuggingFaceImageResultLabel;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;
import com.server.utils.types.DeepChatRequestMessage;
import com.server.utils.types.HugginFaceSpeechResult;
import org.springframework.web.client.RestTemplate;
import com.server.utils.types.DeepChatRequestBody;
import com.server.utils.types.DeepChatTextRespose;
import org.springframework.stereotype.Service;
import com.server.utils.PrintObjectUtil;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import org.slf4j.Logger;
import java.util.List;

// Make sure to set the HUGGING_FACE_API_KEY environment variable in application.properties

@Service
public class HuggingFaceService {
  private static final Logger LOGGER = LoggerFactory.getLogger(HuggingFaceService.class);

  @Value("${HUGGING_FACE_API_KEY}")
  private String huggingFaceAPIKey;
  
  public DeepChatTextRespose conversation(DeepChatRequestBody requestBody) throws Exception {
    LOGGER.info("Received request body: {}", PrintObjectUtil.toJsonString(requestBody));
    HuggingFaceConversationBody conversation = HuggingFaceService.createConversationBody(requestBody.getMessages());

    RestTemplate restTemplate = new RestTemplate();
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Authorization", "Bearer " + huggingFaceAPIKey);
    HttpEntity<HuggingFaceConversationBody> requestEntity = new HttpEntity<>(conversation, headers);
    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill");

    // Send the request to Hugging Face
    ResponseEntity<HuggingFaceConversationResult> response = restTemplate.exchange(
      builder.toUriString(), HttpMethod.POST, requestEntity,HuggingFaceConversationResult.class);

    HuggingFaceConversationResult responseBody = response.getBody();
    if (responseBody == null) throw new Exception("Unexpected response from Hugging Face");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseBody.getGeneratedText());
  }

  private static HuggingFaceConversationBody createConversationBody(DeepChatRequestMessage[] messages) {
    String text = messages[messages.length - 1].getText();
    ArrayList<String> pastUserInputs = new ArrayList<>();
    ArrayList<String> generatedResponses = new ArrayList<>();
    for (int i = 0; i < messages.length - 2; i += 1) {
      DeepChatRequestMessage message = messages[i];
      if (message.getRole().equals("user")) {
        pastUserInputs.add(message.getText());
      } else if (message.getRole().equals("ai")) {
        generatedResponses.add(message.getText());
      }
    }
    HuggingFaceConversationInputs inputs = new HuggingFaceConversationInputs(
      pastUserInputs.toArray(new String[0]), generatedResponses.toArray(new String[0]), text);
    return new HuggingFaceConversationBody(inputs, true);
  }
  
  // You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
  public DeepChatTextRespose imageClassification(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    if (files.size() == 0) throw new Exception("No file was sent");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + huggingFaceAPIKey);
    HttpEntity<byte[]> requestEntity = new HttpEntity<>(files.get(0).getBytes(), headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";

    // Send the request to Hugging Face
    ResponseEntity<HuggingFaceImageResultLabel[]> responseEntity = restTemplate.exchange(
      url, HttpMethod.POST, requestEntity, HuggingFaceImageResultLabel[].class);

    HuggingFaceImageResultLabel[] responseData = responseEntity.getBody();
    if (responseData == null) throw new Exception("Unexpected response from Hugging Face");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseData[0].getLabel());
  }

  // You can use an example audio file here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a
  public DeepChatTextRespose speechRecognition(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    if (files.size() == 0) throw new Exception("No file was sent");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + huggingFaceAPIKey);
    HttpEntity<byte[]> requestEntity = new HttpEntity<>(files.get(0).getBytes(), headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self";

    // Send the request to Hugging Face
    ResponseEntity<HugginFaceSpeechResult> responseEntity = restTemplate.exchange(
      url, HttpMethod.POST, requestEntity, HugginFaceSpeechResult.class);

    HugginFaceSpeechResult responseData = responseEntity.getBody();
    if (responseData == null) throw new Exception("Unexpected response from Hugging Face");
    // Sends response back to Deep Chat using the Response format:
    // https://deepchat.dev/docs/connect/#Response
    return new DeepChatTextRespose(responseData.getText());
  }
}
