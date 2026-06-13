import os
import pickle
import time
import pandas as pd
from pymongo import MongoClient
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
HIRING_CLASSES = ["Strongly Recommended", "Recommended", "Borderline", "Not Recommended"]

def train_model():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    try:
        # Check connection
        client.admin.command('ping')
    except Exception as ping_err:
        print(f"Could not connect to MongoDB: {ping_err}")
        return
        
    db = client['ai_interview_coach']
    collection = db['training_data']
    
    cursor = list(collection.find())
    print(f"Found {len(cursor)} samples in training_data collection.")
    
    # If not enough data, seed the DB with synthetic samples for testing
    if len(cursor) < 5:
        print("Seeding database with synthetic samples for pipeline validation...")
        synthetic_samples = []
        import random
        
        # Ensure we generate samples for each class
        for class_idx, class_name in enumerate(HIRING_CLASSES):
            for _ in range(10):
                if class_idx == 0:  # Strongly Recommended
                    r_score = random.randint(90, 98)
                    a_score = random.randint(90, 98)
                    t_score = random.randint(90, 98)
                    comm_score = random.randint(90, 98)
                    conf_score = random.randint(90, 98)
                    ps_score = random.randint(90, 98)
                elif class_idx == 1:  # Recommended
                    r_score = random.randint(80, 89)
                    a_score = random.randint(80, 89)
                    t_score = random.randint(80, 89)
                    comm_score = random.randint(80, 89)
                    conf_score = random.randint(80, 89)
                    ps_score = random.randint(80, 89)
                elif class_idx == 2:  # Borderline
                    r_score = random.randint(70, 79)
                    a_score = random.randint(70, 79)
                    t_score = random.randint(70, 79)
                    comm_score = random.randint(70, 79)
                    conf_score = random.randint(70, 79)
                    ps_score = random.randint(70, 79)
                else:  # Not Recommended
                    r_score = random.randint(40, 69)
                    a_score = random.randint(40, 69)
                    t_score = random.randint(40, 69)
                    comm_score = random.randint(40, 69)
                    conf_score = random.randint(40, 69)
                    ps_score = random.randint(40, 69)
                    
                s_count = random.randint(5, 20)
                p_count = random.randint(1, 6)
                readiness = (r_score + a_score + t_score + comm_score + conf_score + ps_score) / 6.0
                
                synthetic_samples.append({
                    "resume_score": float(r_score),
                    "ats_score": float(a_score),
                    "technical_score": float(t_score),
                    "communication_score": float(comm_score),
                    "confidence_score": float(conf_score),
                    "problem_solving_score": float(ps_score),
                    "skills_count": float(s_count),
                    "projects_count": float(p_count),
                    "overall_score": float(readiness),
                    "hiring_recommendation": class_name,
                    "is_synthetic": True,
                    "timestamp": time.time()
                })
        collection.insert_many(synthetic_samples)
        cursor = list(collection.find())
        print(f"Successfully seeded database. Now have {len(cursor)} samples.")
        
    df = pd.DataFrame(cursor)
    
    # Input features
    features = ['resume_score', 'ats_score', 'technical_score', 'communication_score', 
                'confidence_score', 'problem_solving_score', 'skills_count', 'projects_count']
                
    X = df[features].astype(float)
    
    # Targets
    y_readiness = df['overall_score'].astype(float)
    
    # Encode hiring recommendation targets dynamically
    le = LabelEncoder()
    y_hiring = le.fit_transform(df['hiring_recommendation'])
    
    print("Training readiness regressor (XGBoost)...")
    reg = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.05)
    reg.fit(X, y_readiness)
    
    print("Training hiring classifier (XGBoost)...")
    num_classes = len(le.classes_)
    clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        objective='multi:softprob' if num_classes > 2 else 'binary:logistic',
        num_class=num_classes if num_classes > 2 else None
    )
    clf.fit(X, y_hiring)
    
    # Save models to models/ directory
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    reg_path = os.path.join(models_dir, 'readiness_model.pkl')
    clf_path = os.path.join(models_dir, 'hiring_model.pkl')
    
    with open(reg_path, 'wb') as f:
        pickle.dump(reg, f)
        
    # Save both model and label encoder for classifier
    with open(clf_path, 'wb') as f:
        pickle.dump((clf, le), f)
        
    print(f"Models successfully saved to:\n  - {reg_path}\n  - {clf_path}")

if __name__ == '__main__':
    train_model()
