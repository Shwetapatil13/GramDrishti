import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/v1/recommendations/analyze'
data = json.dumps({"village_id": "VIL001", "year": 2024, "polygon": {}}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
