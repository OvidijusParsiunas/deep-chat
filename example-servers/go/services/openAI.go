package services

import (
	"mime/multipart"
	"encoding/json"
	"net/http"
	"strings"
	"errors"
	"bytes"
	"bufio"
	"fmt"
	"io"
	"os"
)

// Make sure to set the OPENAI_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

func OpenAIChat(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	chatBodyBytes, err := createChatRequestBodyBytes(w, r, false)
	if err != nil { return err }

	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(chatBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("OPENAI_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return err }
	
	defer resp.Body.Close()

	var resultData OpenAIChatResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil { return err }

	if resultData.OpenAIError.Message != "" {
    return errors.New(resultData.OpenAIError.Message)
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Choices[0].Message.Content)
	if (err != nil) { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}


func OpenAIChatStream(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	chatBodyBytes, err := createChatRequestBodyBytes(w, r, true)
	if err != nil { return err }

	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(chatBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("OPENAI_API_KEY"))

	flusher := w.(http.Flusher)
	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil { return err }

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var resultData OpenAIStreamResult
		err = json.NewDecoder(resp.Body).Decode(&resultData)
		if err != nil { return err }
		if resultData.OpenAIError.Message != "" {
			return errors.New(resultData.OpenAIError.Message)
		}
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)
		if line != "" {
			if strings.HasPrefix(line, "data: [DONE]") { return nil }
			var result OpenAIStreamResult
			err := json.Unmarshal([]byte(line[6:]), &result)
			if err != nil {
				fmt.Println("Error when unmarshalling response chunk:", err)
				return err
			}
			choices := result.Choices
			if len(choices) > 0 {
				// Create response
				jsonResponse, err := CreateTextResponse(w, choices[0].Delta.Content)
				if err != nil { return err }
				// Send response
				fmt.Fprintf(w, "data: %s\n\n", string(jsonResponse))
				flusher.Flush()
			}
		}
	}
	return nil
}


func createChatRequestBodyBytes(w http.ResponseWriter, r *http.Request, stream bool) ([]byte, error) {
	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	var deepChatRequestBody DeepChatRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &deepChatRequestBody)
	if err != nil {
		fmt.Println("Failed to unmarshal request body:", err)
		http.Error(w, "Failed to unmarshal request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	chatBody := createChatBody(deepChatRequestBody, stream)
	return json.Marshal(chatBody)
}

func createChatBody(deepChatRequestBody DeepChatRequestBody, stream bool) OpenAIChatBody {
	chatBody := OpenAIChatBody{
		Messages: make([]OpenAIChatMessage, len(deepChatRequestBody.Messages)),
		Model:    deepChatRequestBody.Model,
	}
	for i, message := range deepChatRequestBody.Messages {
		role := message.Role
		content := message.Text
		updatedRole := role
		if role == "ai" {
			updatedRole = "assistant"
		}
		chatBody.Messages[i] = OpenAIChatMessage{
			Role: updatedRole,
			Content: content,
		}
	}
	if stream {
		chatBody.Stream = true
	}
	return chatBody
}

// By default - the OpenAI API will accept 1024x1024 png images, however other dimensions/formats can sometimes work by default
// You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image-for-openai.png
func OpenAIImage(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil { return err }
	files := r.MultipartForm.File["files"]

	jsonResponse, err := SendImageVariationRequest(w, files)
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}

func SendImageVariationRequest(w http.ResponseWriter, files []*multipart.FileHeader) ([]byte, error) {
	var buf bytes.Buffer
	multipartWriter := multipart.NewWriter(&buf)

	if len(files) > 0 {
		file, err := files[0].Open()
		if err != nil { return nil, err }

		defer file.Close()

		part, err := multipartWriter.CreateFormFile("image", files[0].Filename)
		if err != nil { return nil, err }

		_, err = io.Copy(part, file)
		if err != nil { return nil, err }
	}

	err := multipartWriter.Close()
	if err != nil { return nil, err }

	req, err := http.NewRequest("POST", "https://api.openai.com/v1/images/variations", &buf)
	if err != nil { return nil, err }

	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+ os.Getenv("OPENAI_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil { return nil, err }

	defer resp.Body.Close()

	var resultData OpenAIImageResult
	json.NewDecoder(resp.Body).Decode(&resultData)

	if resultData.OpenAIError.Message != "" {
    return nil, errors.New(resultData.OpenAIError.Message)
	}

	// Create response
	jsonResponse, err := CreateImageResponse(w, resultData.Data[0].Url)
	if err != nil { return nil, err }

	return jsonResponse, nil
}
