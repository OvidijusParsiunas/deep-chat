import requests
import json
import os

# Make sure to set the STABILITY_API_KEY environment variable in a .env file (create if does not exist) - see .env.example

class StabilityAI:
    def text_to_image(self, body):
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + os.getenv("STABILITY_API_KEY")
        }
        description_body = {"text_prompts": [{"text": body["messages"][0]["text"]}]}
        response = requests.post(
            "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image", json=description_body, headers=headers)
        json_response = response.json()
        if "message" in json_response:    
            raise Exception(json_response["message"])
        result = json_response["artifacts"][0]["base64"]
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"files": [{"type": "image", "src": "data:image/png;base64," + result}]}

    # You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
    def image_to_image(self, request):
        url = "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/image-to-image"
        headers = {
            "Authorization": "Bearer " + os.getenv("STABILITY_API_KEY")
        }
        # Files are stored inside a files object
        # https://deepchat.dev/docs/connect
        request_files = request.files.getlist("files")
        image_file = request_files[0]
        form = {
            "init_image": (image_file.filename, image_file.read(), image_file.mimetype),
            # When sending text messages along with files - they are stored inside the data form
            # https://deepchat.dev/docs/connect
            "text_prompts[0][text]": json.loads(request.form.get("message1"))['text'],
            "text_prompts[0][weight]": 1
        }
        response = requests.post(url, files=form, headers=headers)
        json_response = response.json()
        if "message" in json_response:    
            raise Exception(json_response["message"])
        result = json_response["artifacts"][0]["base64"]
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"files": [{"type": "image", "src": "data:image/png;base64," + result}]}

    # You can use an example image here: https://github.com/OvidijusParsiunas/deep-chat/blob/main/example-servers/ui/assets/example-image.png
    def image_to_image_upscale(self, files):
        url = "https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale"
        headers = {
            "Authorization": "Bearer " + os.getenv("STABILITY_API_KEY")
        }
        # Files are stored inside a files object
        # https://deepchat.dev/docs/connect
        image_file = files[0]
        form = {
            "image": (image_file.filename, image_file.read(), image_file.mimetype)
        }
        response = requests.post(url, files=form, headers=headers)
        json_response = response.json()
        if "message" in json_response:    
            raise Exception(json_response["message"])
        result = json_response["artifacts"][0]["base64"]
        # Sends response back to Deep Chat using the Response format:
        # https://deepchat.dev/docs/connect/#Response
        return {"files": [{"type": "image", "src": "data:image/png;base64," + result}]}
