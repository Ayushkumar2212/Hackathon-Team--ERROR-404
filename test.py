import urllib.request
import json
import urllib.error

url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
data = {
    "model": "gemini-1.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
}
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer AIzaSyBvS7KtwT52oTEOmW8vYXT6Tod3jb0TU_4"
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as f:
        print(f.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode("utf-8"))
except Exception as e:
    print(e)
