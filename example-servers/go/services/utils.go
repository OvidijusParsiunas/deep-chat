package services

import (
	"encoding/json"
	"net/http"
	"fmt"
)

func enableCors(w *http.ResponseWriter) {
	// This will need to be reconfigured to suit your app
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func ProcessIncomingRequest(w *http.ResponseWriter, r *http.Request) bool {
	enableCors(w)
	// This is important as the browser sends a preflight OPTIONS request before the POST request
	if r.Method == "OPTIONS" {
		(*w).WriteHeader(204)
		return false
	}
	if r.Method != "POST" {
		http.Error(*w, "Method is not supported.", http.StatusNotFound)
		return false
	}
	return true
}

func CreateTextResponse(w http.ResponseWriter, text string) ([]byte, error) {
	// Create a response to Deep Chat using the Result format:
	// https://deepchat.dev/docs/connect/#Result
	response := DeepChatTextResponse{
		Result: struct {
			Text string `json:"text"`
		}{
			Text: text,
		},
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal JSON response");
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
	}
	return jsonResponse, err
}

func CreateImageResponse(w http.ResponseWriter, src string) ([]byte, error) {
	// Create a response to Deep Chat using the Result format:
	// https://deepchat.dev/docs/connect/#Result
	response := DeepChatFileResponse{
		Result: struct {
			Files []File `json:"files"`
		}{
			Files: []File{{Type: "image", Src: src}},
		},
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal JSON response");
		http.Error(w, "Failed to marshal JSON response", http.StatusInternalServerError)
	}
	return jsonResponse, err
}