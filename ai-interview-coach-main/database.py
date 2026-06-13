from pymongo import MongoClient
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Connection String
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = None
db = None

collections = {}

def get_db():
    global client, db, collections
    if db is None:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            # Test connection
            client.admin.command('ping')
            
            db = client['ai_interview_coach']
            
            # Map collections
            collections = {
                'users': db.users,
                'resumes': db.resumes,
                'interview_sessions': db.interview_sessions,
                'interview_reports': db.interview_reports,
                'career_coach': db.career_coach
            }
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            client = None
            db = None
            
    return db, collections

def is_db_available():
    db_instance, _ = get_db()
    return db_instance is not None
