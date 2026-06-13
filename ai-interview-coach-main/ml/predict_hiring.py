import os
import pickle
import pandas as pd

def predict_hiring(features):
    """
    Predict Hiring Recommendation using trained XGBoost model and LabelEncoder.
    Falls back to heuristic rules if model is not trained.
    """
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'hiring_model.pkl')
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                
            if isinstance(model_data, tuple):
                model, le = model_data
                df = pd.DataFrame([features])
                pred_encoded = model.predict(df)[0]
                return le.inverse_transform([int(pred_encoded)])[0]
        except Exception as e:
            print(f"Error predicting hiring recommendation with ML model: {e}")
            
    # Heuristic Fallback
    readiness = (features['resume_score'] + features['ats_score'] + features['technical_score'] + 
                 features['communication_score'] + features['problem_solving_score'] + features['confidence_score']) / 6.0
                 
    if readiness >= 90:
        return "Strongly Recommended"
    elif readiness >= 80:
        return "Recommended"
    elif readiness >= 70:
        return "Borderline"
    else:
        return "Not Recommended"
