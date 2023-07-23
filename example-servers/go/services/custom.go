package services

import (
	"net/http"
	"time"
	"fmt"
	"io"
)

func Chat(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	body, err := io.ReadAll(r.Body)
	if err != nil { return err }

	fmt.Println("Request Body:", string(body))


	// Create response
	jsonResponse, err := CreateTextResponse(w, "This is a response from the Go server. Thank you for your message!")
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}

func ChatStream(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }
	
	// Text messages are stored inside request body using the Deep Chat JSON format:
	// https://deepchat.dev/docs/connect
	body, err := io.ReadAll(r.Body)
	if err != nil { return err }

	fmt.Println("Request Body:", string(body))
	
	respondWithStream(w)
	return nil
}

func respondWithStream(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/event-stream")
	flusher := w.(http.Flusher)
	responseChunks := []string{"This", "is", "a", "response", "from", "the", "Go", "server", ".", "Thankyou", "for", "your", "message!"}
	ticker := time.NewTicker(70 * time.Millisecond)
	chunkIndex := 0

	outerloop:
		for {
			select {
				case <-ticker.C:
					// create response
					jsonResponse, err := CreateTextResponse(w, responseChunks[chunkIndex] + " ")
					if (err != nil) { break outerloop }
					// Send response
					w.Write([]byte("data: " + string(jsonResponse) + "\n\n"))
					chunkIndex += 1
					flusher.Flush()
				default:
					if chunkIndex == len(responseChunks) {
						break outerloop
					}
			}
		}

	ticker.Stop()
}

func Files(w http.ResponseWriter, r *http.Request) error {
	err, skipPreflight := ProcessIncomingRequest(&w, r)
	if err != nil { return err }
	if skipPreflight { return nil }

	// Files are stored inside a form using Deep Chat request FormData format:
	// https://deepchat.dev/docs/connect
	err = r.ParseMultipartForm(32 << 20) // Max memory of 32MB
	if err == nil {
		files, ok := r.MultipartForm.File["files"]
		if ok {
			for _, file := range files {
				fileName := file.Filename
				fmt.Println("File name:", fileName)
			}
		}
		// If there are text messages sent along with the files, they will also be in the form
		for key, values := range r.Form {
			// Skip the "files" property
			if key == "files" { continue }

			for _, value := range values {
				fmt.Println("Message", value)
			}
		}
	} else {
		// If message is sent without any files, the text will be stored inside body using Deep Chat JSON request format:
		// https://deepchat.dev/docs/connect
		body, err := io.ReadAll(r.Body)
		if err != nil { return err }

		fmt.Println("Request Body:", string(body))
	}

	// Create response
	jsonResponse, err := CreateTextResponse(w, "This is a response from the Go server. Thank you for your message!")
	if err != nil { return err }

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
	return nil
}
