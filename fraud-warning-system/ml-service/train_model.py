"""
ML Service Entry Point - Run this after starting backend
This script pre-trains the model before starting Flask
"""
from model import train_model

if __name__ == '__main__':
    print("=== Training Fraud Detection Model ===")
    model, scaler = train_model()
    print("=== Training Complete ===")
