package services

import (
	"encoding/json"
	"net/http"
	"errors"
	"bytes"
	"fmt"
	"io"
	"os"
)

// Make sure to set the HUGGING_FACE_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

func HuggingFaceConversation(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	conversationBodyBytes, err := createConversationRequestBodyBytes(w, r)
	if err != nil { return err }

	req, _ := http.NewRequest(
		"POST", "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", bytes.NewBuffer(conversationBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	
	defer resp.Body.Close()

	var resultData HuggingFaceConversationResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.Error != "" {
    return errors.New(resultData.Error)
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.GeneratedText)
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}

func createConversationRequestBodyBytes(w http.ResponseWriter, r *http.Request) ([]byte, error) {
	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil { return userRequestBodyBytes, err }

	var deepChatRequestBody DeepChatRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &deepChatRequestBody)
	if err != nil { return userRequestBodyBytes, err }

	conversationBody := createConversationBody(deepChatRequestBody.Messages)
	fmt.Println(conversationBody)
	return json.Marshal(conversationBody)
}

func createConversationBody(messages []DeepChatRequestMessage) HuggingFaceConversationBody {
	previousMessages := messages[:len(messages)-1]
	var pastUserInputs []string
	var generatedResponses []string
	for _, message := range previousMessages {
		if message.Role == "user" {
			pastUserInputs = append(pastUserInputs, message.Text)
		} else if message.Role == "ai" {
			generatedResponses = append(generatedResponses, message.Text)
		}
	}
	return HuggingFaceConversationBody{
		Inputs: HuggingFaceConversationInputs{
			PastUserInputs: pastUserInputs,
			GeneratedResponses: generatedResponses,
			Text: messages[len(messages)-1].Text,
		},
		WaitForModel: true,
	}
}

// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
func HuggingFaceImage(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil { return err }
	files := r.MultipartForm.File["files"]

	if (len(files) == 0) { return errors.New("no file was attached") }
	file, err := files[0].Open()
	if err != nil { return err }

	defer file.Close()

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/google/vit-base-patch16-224", file)
	if err != nil { return err }

	req.Header.Set("Authorization", "Bearer " + os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }

	defer resp.Body.Close()

	// Read the response body
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil { return err }

	rawResponse := json.RawMessage(responseBody)

	// Check if the response is an error
	var errorData HugginFaceFileError
	if err := json.Unmarshal(rawResponse, &errorData); err == nil && errorData.Error != "" {
		return errors.New(errorData.Error)
	}

	// Check if the response is a successful result
	var resultData []HugginFaceImageResultLabel
	if err := json.Unmarshal(rawResponse, &resultData); err == nil {
		// Create response
		jsonResponse, err := CreateTextResponse(w, resultData[0].Label)
		if err != nil { return err }

		// Send response
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
		return nil
	}

	return errors.New("unexpected response format")
}

// You can use an example audio here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-audio.m4a
func HuggingFaceSpeech(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil { return err }
	files := r.MultipartForm.File["files"]

	if (len(files) == 0) { return errors.New("no file was attached") }
	file, err := files[0].Open()
	if err != nil { return err }

	defer file.Close()

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self", file)
	if err != nil { return err }

	req.Header.Set("Authorization", "Bearer " + os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }

	defer resp.Body.Close()

	// Read the response body
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil { return err }

	rawResponse := json.RawMessage(responseBody)

	// Check if the response is an error
	var errorData HugginFaceFileError
	if err := json.Unmarshal(rawResponse, &errorData); err == nil && errorData.Error != "" {
		return errors.New(errorData.Error)
	}

	// Check if the response is a successful result
	var resultData HugginFaceSpeechResult
	if err := json.Unmarshal(rawResponse, &resultData); err == nil {
		// Create response
		jsonResponse, err := CreateTextResponse(w, resultData.Text)
		if err != nil { return err }

		// Send response
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
		return nil
	}

	return errors.New("unexpected response format")
}