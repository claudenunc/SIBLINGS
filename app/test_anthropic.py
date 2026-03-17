import anthropic
import os

api_key = os.environ.get("ANTHROPIC_API_KEY")

if not api_key:
    print("No ANTHROPIC_API_KEY environment variable set.")
    exit(1)

client = anthropic.Anthropic(api_key=api_key)

try:
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=4096,
        temperature=1,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "test\n"
                    }
                ]
            }
        ]
    )
    print("SUCCESS! Response:")
    print(message.content)
except Exception as e:
    print("ERROR:")
    print(e)
