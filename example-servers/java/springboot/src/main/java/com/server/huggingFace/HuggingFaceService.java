package com.server.huggingFace;

import com.server.utils.deepChat.HuggingFaceConversationInputs;
import com.server.utils.deepChat.HuggingFaceConversationResult;
import com.server.utils.deepChat.HuggingFaceImageResultLabel;
import com.server.utils.deepChat.HuggingFaceConversationBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;
import com.server.utils.deepChat.DeepChatRequestMessage;
import org.springframework.web.multipart.MultipartFile;
import com.server.utils.deepChat.DeepChatFileResponse;
import com.server.utils.deepChat.DeepChatRequestBody;
import com.server.utils.deepChat.DeepChatTextRespose;
import com.server.utils.deepChat.HugginFaceSpeechResult;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.server.utils.deepChat.OpenAIImageResult;
import com.server.utils.deepChat.DeepChatFile;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import com.server.utils.PrintObjectUtil;
import org.springframework.http.*;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.Arrays;
import org.slf4j.Logger;
import java.util.List;

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

    try {
      // Send the request to Hugging Face
      ResponseEntity<HuggingFaceConversationResult> response = restTemplate.exchange(
        builder.toUriString(), HttpMethod.POST, requestEntity,HuggingFaceConversationResult.class);

      if (response.getStatusCode() == HttpStatus.OK) {
        HuggingFaceConversationResult responseBody = response.getBody();
        if (responseBody == null) throw new Exception("Unexpected response from Hugging Face");
        // Sends response back to Deep Chat using the Result format:
        // https://deepchat.dev/docs/connect/#Result
        return new DeepChatTextRespose(responseBody.getGeneratedText());
      } else {
        throw new Exception(response.getStatusCode().toString());
      }
    } catch (Exception e) {
      LOGGER.error("Error when calling Hugging Face API", e);
      throw new Exception(e);
    }
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
  
  public DeepChatTextRespose imageClassification(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    if (files.size() == 0) throw new Exception("No file was sent");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + huggingFaceAPIKey);
    HttpEntity<byte[]> requestEntity = new HttpEntity<>(files.get(0).getBytes(), headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224";
    try {
      // Send the request to Hugging Face
      ResponseEntity<HuggingFaceImageResultLabel[]> responseEntity = restTemplate.exchange(
        url, HttpMethod.POST, requestEntity, HuggingFaceImageResultLabel[].class);

      if (responseEntity.getStatusCode() == HttpStatus.OK) {
        HuggingFaceImageResultLabel[] responseData = responseEntity.getBody();
        if (responseData == null) throw new Exception("Unexpected response from Hugging Face");
        // Sends response back to Deep Chat using the Result format:
        // https://deepchat.dev/docs/connect/#Result
        return new DeepChatTextRespose(responseData[0].getLabel());
      }
    } catch (Exception e) {
      LOGGER.error("Error when calling Hugging Face API", e);
      throw new Exception(e);
    }
    return null;
  }

    public DeepChatTextRespose speechRecognition(@RequestPart("files") List<MultipartFile> files) throws Exception {
    // Files are stored inside a form using Deep Chat request FormData format:
    // https://deepchat.dev/docs/connect
    if (files.size() == 0) throw new Exception("No file was sent");

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + huggingFaceAPIKey);
    HttpEntity<byte[]> requestEntity = new HttpEntity<>(files.get(0).getBytes(), headers);
    RestTemplate restTemplate = new RestTemplate();
    String url = "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self";
    try {
      // Send the request to Hugging Face
      ResponseEntity<HugginFaceSpeechResult> responseEntity = restTemplate.exchange(
        url, HttpMethod.POST, requestEntity, HugginFaceSpeechResult.class);

      if (responseEntity.getStatusCode() == HttpStatus.OK) {
        HugginFaceSpeechResult responseData = responseEntity.getBody();
        if (responseData == null) throw new Exception("Unexpected response from Hugging Face");
        // Sends response back to Deep Chat using the Result format:
        // https://deepchat.dev/docs/connect/#Result
        return new DeepChatTextRespose(responseData.getText());
      }
    } catch (Exception e) {
      LOGGER.error("Error when calling Hugging Face API", e);
      throw new Exception(e);
    }
    return null;
  }
}
