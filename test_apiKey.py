import urllib.request
import json

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBvS7KtwT52oTEOmW8vYXT6Tod3jb0TU_4"
data = json.dumps({"contents": [{"parts":[{"text": "Hello"}]}]}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
