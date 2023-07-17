package services

import (
	"encoding/json"
	"net/http"
	"bytes"
	"fmt"
	"io"
	"os"
)

func HuggingFaceConversation(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	conversationBodyBytes, err := createConversationRequestBodyBytes(w, r)
	if err != nil { return }

	req, _ := http.NewRequest(
		"POST", "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", bytes.NewBuffer(conversationBodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling Hugging Face API:", err)
		http.Error(w, "Error when calling Hugging Face API", http.StatusInternalServerError)
		return
	}
	
	defer resp.Body.Close()

	var resultData HuggingFaceConversationResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when decoding Hugging Face result:", err)
		http.Error(w, "Error when decoding Hugging Face result", http.StatusInternalServerError)
		return
	}

	if resultData.Error != "" {
    fmt.Println("API error:", resultData.Error)
    http.Error(w, resultData.Error, http.StatusInternalServerError)
    return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.GeneratedText)
	if (err != nil) { return }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func createConversationRequestBodyBytes(w http.ResponseWriter, r *http.Request) ([]byte, error) {
	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	userRequestBodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	var userRequestBody UserRequestBody
	err = json.Unmarshal(userRequestBodyBytes, &userRequestBody)
	if err != nil {
		fmt.Println("Failed to unmarshal request body:", err)
		http.Error(w, "Failed to unmarshal request body", http.StatusInternalServerError)
		return userRequestBodyBytes, err
	}

	conversationBody := createConversationBody(userRequestBody.Messages)
	fmt.Println(conversationBody)
	return json.Marshal(conversationBody)
}

func createConversationBody(messages []UserRequestMessage) HuggingFaceConversationBody {
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

func HuggingFaceImage(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err := r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}
	files := r.MultipartForm.File["files"]

	if (len(files) == 0) { return }
	file, err := files[0].Open()
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	defer file.Close()

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/google/vit-base-patch16-224", file)
	if err != nil {
		fmt.Println("Error when calling Hugging Face API:", err)
		http.Error(w, "Error when calling Hugging Face API", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", "Bearer "+ os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling Hugging Face API:", err)
		http.Error(w, "Error when calling Hugging Face API", http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	var resultData []HugginFaceImageResultLabel
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when decoding Hugging Face result:", err)
		http.Error(w, "Error when decoding Hugging Face result", http.StatusInternalServerError)
		return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData[0].Label)
	if (err != nil) { return }

	if jsonResponse != nil {
		// Send response
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
	}
}

func HuggingFaceSpeech(w http.ResponseWriter, r *http.Request) {
	shouldContinue := ProcessIncomingRequest(&w, r)
	if !shouldContinue { return }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err := r.ParseMultipartForm(32 << 20) // 32MB maximum file size
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}
	files := r.MultipartForm.File["files"]

	if (len(files) == 0) { return }
	file, err := files[0].Open()
	if err != nil {
		fmt.Println("Failed to read request body:", err)
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}

	defer file.Close()

	req, err := http.NewRequest("POST", "https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self", file)
	if err != nil {
		fmt.Println("Error when calling Hugging Face API:", err)
		http.Error(w, "Error when calling Hugging Face API", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", "Bearer "+ os.Getenv("HUGGING_FACE_API_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error when calling Hugging Face API:", err)
		http.Error(w, "Error when calling Hugging Face API", http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	var resultData HugginFaceSpeechResult
	err = json.NewDecoder(resp.Body).Decode(&resultData)
	if err != nil {
		fmt.Println("Error when decoding Hugging Face result:", err)
		http.Error(w, "Error when decoding Hugging Face result", http.StatusInternalServerError)
		return
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, resultData.Text)
	if (err != nil) { return }

	if jsonResponse != nil {
		// Send response
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonResponse)
	}
}