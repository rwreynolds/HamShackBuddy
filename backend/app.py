import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), default_headers={"OpenAI-Beta": "assistants=v2"})
assistant_id = os.getenv("ASSISTANT_ID")
thread = client.beta.threads.create()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Create a thread
        # thread = client.beta.threads.create()

        # Add message to thread
        client.beta.threads.messages.create(
            thread_id=thread.id,
            role="user",
            content=user_message
        )

        # Run the assistant
        run = client.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=assistant_id
        )

        # Poll for the run to complete
        while run.status != "completed":
            time.sleep(1)
            run = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )

            if run.status == "failed":
                return jsonify({"error": "Assistant run failed"}), 500

        # Get messages from the thread
        messages = client.beta.threads.messages.list(
            thread_id=thread.id
        )

        # Format and return the assistant's response
        response_messages = []
        for msg in messages.data:
            if msg.role == "assistant":
                for content in msg.content:
                    if content.type == "text":
                        response_messages.append(content.text.value)

        # Return the most recent assistant message
        if response_messages:
            return jsonify({"response": response_messages[0]})
        else:
            return jsonify({"error": "No response from assistant"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)