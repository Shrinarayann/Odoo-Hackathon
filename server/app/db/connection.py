import os
from mongoengine import connect, disconnect
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

class DatabaseConnection:
    """
    MongoDB connection manager using mongoengine
    """
    
    def __init__(self):
        self.is_connected = False
        self.connection = None
    
    def connect_db(self):
        """
        Establish connection to MongoDB
        """
        try:
            # Get MongoDB URI from environment variable
            mongodb_uri = os.getenv('MONGO_URI')
            
            # Additional connection options
            connection_options = {
                'host': mongodb_uri,
                'serverSelectionTimeoutMS': 5000,  # 5 second timeout
                'connectTimeoutMS': 10000,         # 10 second timeout
                'socketTimeoutMS': 20000,          # 20 second timeout
                'maxPoolSize': 50,                 # Maximum connection pool size
                'retryWrites': True,               # Enable retryable writes
            }
            
            # Connect to MongoDB
            self.connection = connect(**connection_options)
            self.is_connected = True
            
            print(f"✅ Successfully connected to MongoDB")
            print(f"📍 Database URI: {mongodb_uri}")
            
            return True
            
        except ConnectionFailure as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.is_connected = False
            raise e
            
        except ServerSelectionTimeoutError as e:
            print(f"❌ MongoDB server selection timeout: {e}")
            print("💡 Make sure MongoDB is running and accessible")
            self.is_connected = False
            raise e
            
        except Exception as e:
            print(f"❌ Unexpected database connection error: {e}")
            self.is_connected = False
            raise e
    
    def disconnect_db(self):
        """
        Disconnect from MongoDB
        """
        try:
            if self.is_connected:
                disconnect()
                self.is_connected = False
                print("✅ Disconnected from MongoDB")
        except Exception as e:
            print(f"❌ Error disconnecting from MongoDB: {e}")
    
    def get_connection_status(self):
        """
        Check if database is connected
        """
        return self.is_connected
    
    def health_check(self):
        """
        Perform a simple health check on the database connection
        """
        try:
            from mongoengine.connection import get_connection
            
            if not self.is_connected:
                return False, "Not connected to database"
            
            # Try to get the connection and ping the server
            conn = get_connection()
            conn.admin.command('ping')
            
            return True, "Database connection is healthy"
            
        except Exception as e:
            return False, f"Database health check failed: {str(e)}"

# Create a global instance
db_manager = DatabaseConnection()

def init_db():
    """
    Initialize database connection
    """
    return db_manager.connect_db()

def close_db():
    """
    Close database connection
    """
    db_manager.disconnect_db()

def get_db_status():
    """
    Get current database connection status
    """
    return db_manager.get_connection_status()

def check_db_health():
    """
    Check database health
    """
    return db_manager.health_check()