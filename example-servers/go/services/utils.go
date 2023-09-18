package services

import (
	"encoding/json"
	"net/http"
	"errors"
	"fmt"
)

func enableCors(w *http.ResponseWriter) {
	// This will need to be reconfigured to suit your app
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func ProcessIncomingRequest(w *http.ResponseWriter, r *http.Request) (error, bool) {
	enableCors(w)
	// This is important as the browser sends a preflight OPTIONS request before the POST request
	if r.Method == "OPTIONS" {
		(*w).WriteHeader(204)
		return nil, true
	}
	if r.Method != "POST" {
		return errors.New("Invalid request method - expected POST, got: " + r.Method), false
	}
	return nil, false
}

func CreateTextResponse(w http.ResponseWriter, text string) ([]byte, error) {
	// Create a response to Deep Chat using the Response format:
	// https://deepchat.dev/docs/connect/#Response
	response := DeepChatTextResponse{
		Text: text,
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal JSON response");
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
	}
	return jsonResponse, err
}

func CreateImageResponse(w http.ResponseWriter, src string) ([]byte, error) {
	// Create a response to Deep Chat using the Response format:
	// https://deepchat.dev/docs/connect/#Response
	response := DeepChatFileResponse{
		Files: []File{{Type: "image", Src: src}},
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal JSON response");
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
	}
	return jsonResponse, err
}

func ErrorHandler(f func(w http.ResponseWriter, r *http.Request) error) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if err := f(w, r); err != nil {
			fmt.Println("Error:", err)
			jsonResponse, err := createErrorResponse(w, err.Error())
			if (err != nil) { return }
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write(jsonResponse)
    }
  }
}

func createErrorResponse(w http.ResponseWriter, text string) ([]byte, error) {
	// Create a response to Deep Chat using the Response format:
	// https://deepchat.dev/docs/connect/#Response
	response := DeepChatErrorResponse{
		Error: text,
	}

	jsonResponse, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal JSON response");
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
	}
	return jsonResponse, err
}
