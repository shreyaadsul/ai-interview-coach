import os
import pickle
import pandas as pd

def predict_readiness(features):
    """
    Predict Interview Readiness Score using trained XGBoost model.
    Falls back to heuristic rules if model is not trained.
    """
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'readiness_model.pkl')
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            df = pd.DataFrame([features])
            pred = model.predict(df)[0]
            return float(max(0, min(100, pred)))
        except Exception as e:
            print(f"Error predicting readiness with ML model: {e}")
            
    # Heuristic Fallback
    readiness = (features['resume_score'] + features['ats_score'] + features['technical_score'] + 
                 features['communication_score'] + features['problem_solving_score'] + features['confidence_score']) / 6.0
    return float(max(0, min(100, readiness)))
