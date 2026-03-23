from flask import Flask, request, jsonify
from flask_cors import CORS
from model import load_or_train, predict
import traceback
import os

app = Flask(__name__)
CORS(app)

# Load or train model at startup
print("Initializing ML model...")
model, scaler = load_or_train()
print("ML model ready!")


# ✅ ADD THIS (FIX FOR 404 + FALLBACK ISSUE)
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'ML service is running'}), 200


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'Fraud Detection ML Service Running'})


def _handle_predict():
    try:
        activity = request.get_json()
        if not activity:
            return jsonify({'error': 'No data provided'}), 400

        result = predict(activity, model, scaler)
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/analyze', methods=['POST'])
def analyze():
    return _handle_predict()


# Backward-compatible alias (older clients used /predict)
@app.route('/predict', methods=['POST'])
def predict_route():
    return _handle_predict()


@app.route('/retrain', methods=['POST'])
def retrain():
    """Endpoint to retrain the model with new data"""
    global model, scaler
    try:
        from model import train_model
        model, scaler = train_model()
        return jsonify({'status': 'success', 'message': 'Model retrained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv("PORT", "5001"))
    app.run(host='0.0.0.0', port=port, debug=False)
