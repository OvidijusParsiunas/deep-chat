package services

type UserRequestBody struct {
	Messages []UserRequestMessage `json:"messages"`
	Model string `json:"model"`
	Stream bool `json:"stream"`
}

type UserRequestMessage struct {
	Role string `json:"role"`
	Text string `json:"text"`
}

type OpenAIChatBody struct {
	Messages []OpenAIChatMessage `json:"messages"`
	Model string `json:"model"`
	Stream bool `json:"stream"`
}

type OpenAIChatMessage struct {
	Role string `json:"role"`
	Content string `json:"content"`
}

type OpenAIChatResult struct {
	Choices []OpenAIChatResultChoice `json:"choices"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIChatResultChoice struct {
	Message OpenAIChatResultMessage `json:"message"`
}

type OpenAIChatResultMessage struct {
	Content string `json:"content"`
}

type OpenAIStreamResult struct {
	Choices []OpenAIStreamResultChoice `json:"choices"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIStreamResultChoice struct {
	Delta OpenAIStreamResultMessage `json:"delta"`
}

type OpenAIStreamResultMessage struct {
	Content string `json:"content"`
}

type OpenAIImageResult struct {
	Data []OpenAIResultFileData `json:"data"`
	OpenAIError OpenAIError `json:"error"`
}

type OpenAIResultFileData struct {
	Url string `json:"url"`
}

type OpenAIError struct {
	Message string `json:"message"`
}

type DeepChatTextResponse struct {
	Result struct {
		Text string `json:"text"`
	} `json:"result"`
}

type DeepChatFileResponse struct {
	Result struct {
		Files []File `json:"files"`
	} `json:"result"`
}

type File struct {
	Type string `json:"type"`
	Src  string `json:"src"`
}