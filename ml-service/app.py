from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
import numpy as np

app = Flask(__name__)

# Simple model training with dummy data
data = np.array([
    [9, 10],   # normal login time
    [10, 12],
    [11, 15],
    [14, 20],
    [15, 18],
])

model = IsolationForest(contamination=0.2)
model.fit(data)

@app.route("/analyze", methods=["POST"])
def analyze():
    activity = request.json
    
    login_hour = activity.get("login_hour", 10)
    actions = activity.get("actions", 10)

    input_data = np.array([[login_hour, actions]])

    prediction = model.predict(input_data)

    if prediction[0] == -1:
        return jsonify({
            "riskScore": 85,
            "isAnomaly": True,
            "reasons": ["Unusual login time or high activity"]
        })
    else:
        return jsonify({
            "riskScore": 10,
            "isAnomaly": False,
            "reasons": []
        })

if __name__ == "__main__":
    app.run(port=8000)