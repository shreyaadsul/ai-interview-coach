try:
    from pymongo import MongoClient
    HAS_PYMONGO = True
except ImportError:
    MongoClient = None
    HAS_PYMONGO = False

import os
import logging
import uuid
import copy
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Connection String
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = None
db = None
collections = {}

# In-memory global mock database instance
_mock_db_instance = None

class MockCollection:
    def __init__(self, name):
        self.name = name
        self._documents = []

    def insert_one(self, document):
        if '_id' not in document:
            document['_id'] = str(uuid.uuid4())
        self._documents.append(copy.deepcopy(document))
        class MockInsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return MockInsertResult(document['_id'])

    def find_one(self, query, projection=None, sort=None):
        results = self._find_all(query)
        if not results:
            return None
        if sort:
            for key, direction in reversed(sort):
                results.sort(key=lambda x: x.get(key, 0) or 0, reverse=(direction == -1))
        doc = results[0]
        doc_copy = copy.deepcopy(doc)
        if projection:
            for k, val in list(projection.items()):
                if val == 0:
                    doc_copy.pop(k, None)
        return doc_copy

    def find(self, query, projection=None):
        results = self._find_all(query)
        class MockCursor:
            def __init__(self, docs):
                self.docs = docs
            def sort(self, key, direction=-1):
                self.docs.sort(key=lambda x: x.get(key, 0) or 0, reverse=(direction == -1))
                return self
            def __iter__(self):
                return iter(self.docs)
            def __getitem__(self, index):
                return self.docs[index]
            def list(self):
                return self.docs
        
        copied_results = [copy.deepcopy(d) for d in results]
        if projection:
            for d in copied_results:
                for k, val in list(projection.items()):
                    if val == 0:
                        d.pop(k, None)
        return MockCursor(copied_results)

    def update_one(self, query, update, upsert=False):
        results = self._find_all(query)
        if not results:
            if upsert:
                new_doc = {}
                for k, v in query.items():
                    if not k.startswith('$'):
                        new_doc[k] = v
                self._apply_update(new_doc, update)
                self.insert_one(new_doc)
            return
        self._apply_update(results[0], update)

    def update_many(self, query, update, upsert=False):
        results = self._find_all(query)
        for doc in results:
            self._apply_update(doc, update)

    def _find_all(self, query):
        matched = []
        for doc in self._documents:
            match = True
            for k, v in query.items():
                if k.startswith('$'):
                    continue
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc)
        return matched

    def _apply_update(self, doc, update):
        if '$set' in update:
            for k, v in update['$set'].items():
                if '.' in k:
                    parts = k.split('.')
                    current = doc
                    for part in parts[:-1]:
                        if part not in current or not isinstance(current[part], dict):
                            current[part] = {}
                        current = current[part]
                    current[parts[-1]] = v
                else:
                    doc[k] = v

class MockDB:
    def __init__(self):
        self._collections = {}

    def __getattr__(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]

    def __getitem__(self, name):
        return getattr(self, name)

def get_db():
    global client, db, collections, _mock_db_instance
    if db is None:
        try:
            if not HAS_PYMONGO:
                raise ImportError("pymongo package not found.")
            # Attempt to connect to MongoDB, if URI is configured
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000)
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
            logger.warning(f"Failed to connect to MongoDB or initialize pymongo: {e}. Falling back to in-memory database.")
            client = None
            
            # Initialize MockDB fallback
            if _mock_db_instance is None:
                _mock_db_instance = MockDB()
            
            db = _mock_db_instance
            collections = {
                'users': db.users,
                'resumes': db.resumes,
                'interview_sessions': db.interview_sessions,
                'interview_reports': db.interview_reports,
                'career_coach': db.career_coach
            }
            
    return db, collections

def is_db_available():
    # Since mock db is always available as a fallback, return True
    return True
