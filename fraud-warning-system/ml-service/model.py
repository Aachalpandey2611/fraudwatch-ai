import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

try:
    import sklearn
    _SKLEARN_VERSION = sklearn.__version__
except Exception:
    _SKLEARN_VERSION = "unknown"

MODEL_PATH = 'fraud_model.pkl'
SCALER_PATH = 'scaler.pkl'
CALIBRATION_PATH = 'risk_calibration.json'

# Set by load_or_train() / train_model(); used by predict()
_risk_calibration = None

FEATURE_COLUMNS = [
    'hour_of_day',
    'day_of_week',
    'data_volume',
    'transaction_amount',
    'accounts_accessed',
    'session_duration',
    'action_type_encoded',
    'department_encoded',
    'is_weekend',
    'is_after_hours',
    'login_hour_deviation',
    'accounts_access_deviation',
    'data_volume_deviation',
    'transaction_deviation',
]

ACTION_TYPE_MAP = {
    'login': 0,
    'customer_lookup': 1,
    'data_access': 2,
    'report_generation': 3,
    'transaction': 4,
    'account_modification': 5,
    'bulk_download': 6,
    'privilege_escalation': 7,
}

DEPARTMENT_MAP = {
    'Customer Service': 0,
    'Compliance': 1,
    'Risk Management': 2,
    'Loans': 3,
    'Treasury': 4,
    'IT Admin': 5,
}


def extract_features(activity: dict) -> np.ndarray:
    """Extract ML features from raw activity data."""
    from dateutil import parser as dateparser
    import datetime

    ts = activity.get('timestamp')
    if ts:
        try:
            dt = dateparser.parse(str(ts)) if not isinstance(ts, datetime.datetime) else ts
        except Exception:
            dt = datetime.datetime.now()
    else:
        dt = datetime.datetime.now()

    hour = int(activity.get('clientLocalHour', dt.hour))
    day_of_week = int(activity.get('clientDayOfWeek', dt.weekday()))
    hour = max(0, min(23, hour))
    day_of_week = max(0, min(6, day_of_week))
    is_weekend = 1 if day_of_week >= 5 else 0
    is_after_hours = 1 if (hour < 7 or hour > 20) else 0

    action_type = activity.get('actionType', 'login')
    action_encoded = ACTION_TYPE_MAP.get(action_type, 0)

    department = activity.get('department', 'Customer Service')
    dept_encoded = DEPARTMENT_MAP.get(department, 0)

    data_volume = float(activity.get('dataVolume', 0))
    transaction_amount = float(activity.get('transactionAmount', 0)) / 10000
    accounts_accessed = float(activity.get('accountsAccessed', 0))
    session_duration = float(activity.get('sessionDuration', 30))
    login_hour_deviation = float(activity.get('loginHourDeviation', 0))
    accounts_access_deviation = float(activity.get('accountsAccessDeviation', 0))
    data_volume_deviation = float(activity.get('dataVolumeDeviation', 0))
    transaction_deviation = float(activity.get('transactionDeviation', 0)) / 10000

    features = [
        hour,
        day_of_week,
        data_volume,
        transaction_amount,
        accounts_accessed,
        session_duration,
        action_encoded,
        dept_encoded,
        is_weekend,
        is_after_hours,
        login_hour_deviation,
        accounts_access_deviation,
        data_volume_deviation,
        transaction_deviation,
    ]

    return np.array(features).reshape(1, -1)


def generate_training_data(n_normal=1000, n_anomaly=100):
    """Generate synthetic training data for the Isolation Forest."""
    np.random.seed(42)
    normal_data = []

    # Normal business hours activity
    for _ in range(n_normal):
        hour = np.random.randint(8, 18)
        row = [
            hour,
            np.random.randint(0, 5),
            np.random.uniform(1, 100),
            np.random.uniform(0, 5),     # transaction in $10k units
            np.random.randint(1, 15),
            np.random.uniform(15, 240),
            np.random.choice([0, 1, 2, 3, 4, 5]),
            np.random.randint(0, 5),
            0,
            0,
            np.random.uniform(0, 1.5),
            np.random.uniform(0, 8),
            np.random.uniform(0, 40),
            np.random.uniform(0, 2),
        ]
        normal_data.append(row)

    anomaly_data = []
    for _ in range(n_anomaly):
        hour = np.random.choice([0, 1, 2, 3, 22, 23])
        row = [
            hour,
            np.random.randint(0, 7),
            np.random.uniform(500, 2000),
            np.random.uniform(10, 500),
            np.random.randint(50, 500),
            np.random.uniform(1, 30),
            np.random.choice([5, 6, 7]),  # bulk_download, account_mod, priv_esc
            np.random.randint(0, 5),
            np.random.randint(0, 2),
            1,
            np.random.uniform(2, 8),
            np.random.uniform(20, 150),
            np.random.uniform(120, 1200),
            np.random.uniform(8, 80),
        ]
        anomaly_data.append(row)

    X = np.array(normal_data + anomaly_data)
    return X


def _calibration_valid(cal):
    if not cal or "s_low" not in cal or "s_high" not in cal:
        return False
    if cal.get("n_features") != len(FEATURE_COLUMNS):
        return False
    if cal.get("schema_version") != 1:
        return False
    try:
        lo, hi = float(cal["s_low"]), float(cal["s_high"])
    except (TypeError, ValueError):
        return False
    if hi <= lo:
        return False
    return True


def _write_risk_calibration(s_low, s_high):
    """Persist score_samples percentile bounds from training data for risk mapping."""
    span = float(s_high) - float(s_low)
    if span < 1e-6:
        s_low = float(s_low) - 0.01
        s_high = float(s_high) + 0.01

    data = {
        "schema_version": 1,
        "n_features": len(FEATURE_COLUMNS),
        "s_low": float(s_low),
        "s_high": float(s_high),
        "sklearn_version": _SKLEARN_VERSION,
    }
    with open(CALIBRATION_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return data


def _load_risk_calibration_from_disk():
    if not os.path.exists(CALIBRATION_PATH):
        return None
    try:
        with open(CALIBRATION_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def _score_to_risk(score: float, cal: dict) -> int:
    """
    Map IsolationForest score_samples to 0-99.
    Lower score = more anomalous = higher risk (sklearn convention).
    """
    s_low = float(cal["s_low"])
    s_high = float(cal["s_high"])
    eps = 1e-9
    t = (float(score) - s_low) / (s_high - s_low + eps)
    t = max(0.0, min(1.0, t))
    risk = int(round((1.0 - t) * 99))
    return max(0, min(99, risk))


def train_model():
    global _risk_calibration
    print("Generating training data...")
    X = generate_training_data(n_normal=2000, n_anomaly=200)

    print("Fitting scaler...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Training Isolation Forest...")
    model = IsolationForest(
        n_estimators=200,
        contamination=0.08,
        random_state=42,
        max_samples='auto',
        bootstrap=False,
    )
    model.fit(X_scaled)

    print("Calibrating risk score mapping from training score_samples...")
    train_scores = model.score_samples(X_scaled)
    s_low, s_high = np.percentile(train_scores, [2, 98])
    _risk_calibration = _write_risk_calibration(s_low, s_high)
    print(
        f"Risk calibration: s_low={_risk_calibration['s_low']:.6f}, "
        f"s_high={_risk_calibration['s_high']:.6f} -> saved {CALIBRATION_PATH}"
    )

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")
    return model, scaler


def load_or_train():
    global _risk_calibration

    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            print("Loading existing model...")
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)

            expected = len(FEATURE_COLUMNS)
            scaler_features = getattr(scaler, "n_features_in_", expected)

            cal = _load_risk_calibration_from_disk()
            if scaler_features != expected or not _calibration_valid(cal):
                if not _calibration_valid(cal):
                    print("Risk calibration missing or invalid. Retraining model...")
                else:
                    print("Model feature schema changed. Retraining model...")
                model, scaler = train_model()
            else:
                _risk_calibration = cal
                print("Loaded risk calibration from disk.")

        else:
            print("No model found. Training new model...")
            model, scaler = train_model()

    except Exception as e:
        print("❌ Error loading model:", e)
        print("🔁 Retraining new model...")
        model, scaler = train_model()

    if _risk_calibration is None or not _calibration_valid(_risk_calibration):
        print("⚠️ Calibration still invalid after load; retraining...")
        model, scaler = train_model()

    return model, scaler


def predict(activity: dict, model, scaler):
    cal = _risk_calibration
    if cal is None or not _calibration_valid(cal):
        raise RuntimeError(
            "Risk calibration is not loaded. Restart the ML service so load_or_train() can run."
        )

    features = extract_features(activity)
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]   # 1=normal, -1=anomaly
    score = model.score_samples(features_scaled)[0]  # lower = more anomalous
    decision_score = model.decision_function(features_scaled)[0]  # <0 anomalous

    is_anomaly = prediction == -1

    risk_score = _score_to_risk(score, cal)

    reasons = build_reasons(activity, features[0], is_anomaly, risk_score)

    return {
        'riskScore': risk_score,
        'isAnomaly': bool(is_anomaly),
        'reasons': reasons,
        'anomalyScore': float(score),
        'decisionScore': float(decision_score),
    }


def build_reasons(activity, features, is_anomaly, risk_score):
    reasons = []
    hour = features[0]
    data_volume = features[2]
    transaction_amount = features[3]
    accounts_accessed = features[4]
    action_encoded = features[6]
    is_after_hours = features[9]
    login_hour_deviation = features[10]
    accounts_access_deviation = features[11]
    data_volume_deviation = features[12]
    transaction_deviation = features[13]
    day_of_week = features[1]

    action_type = activity.get('actionType', '')
    location = activity.get('location', '')

    if is_after_hours:
        reasons.append(f'Login at unusual hour ({int(hour):02d}:00)')
    if action_type == 'bulk_download':
        reasons.append('Bulk data download initiated')
    if action_type == 'privilege_escalation':
        reasons.append('Privilege escalation detected')
    if action_type == 'account_modification':
        reasons.append('Unauthorized account modification attempt')
    if data_volume > 500:
        reasons.append(f'Unusually large data export: {int(data_volume)}MB')
    if accounts_accessed > 50:
        reasons.append(f'Mass account access: {int(accounts_accessed)} accounts')
    if transaction_amount > 10:
        reasons.append(f'High-value transaction: ${transaction_amount * 10000:,.0f}')
    if location and ('VPN' in location or 'Unknown' in location):
        reasons.append('Access from unrecognized location')
    if day_of_week >= 5 and action_type in ['transaction', 'account_modification']:
        reasons.append('Sensitive action performed on weekend')
    if login_hour_deviation >= 3:
        reasons.append('Login hour deviates from behavioral baseline')
    if accounts_access_deviation >= 20:
        reasons.append('Accounts accessed deviates from baseline')
    if data_volume_deviation >= 100:
        reasons.append('Data volume deviates from baseline')
    if transaction_deviation >= 10:
        reasons.append('Transaction pattern deviates from baseline')
    if risk_score >= 75 and not reasons:
        reasons.append('Statistical behavioral anomaly detected by ML model')
    if not reasons:
        reasons.append('Normal activity pattern')

    return reasons


if __name__ == '__main__':
    train_model()
    print("Model training complete!")
