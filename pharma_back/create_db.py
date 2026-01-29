import MySQLdb
from decouple import config

def create_database():
    try:
        # Connect to MySQL (without specifying a database)
        conn = MySQLdb.connect(
            host=config('DB_HOST', default='localhost'),
            user=config('DB_USER', default='root'),
            passwd=config('DB_PASSWORD', default='root'),
            port=int(config('DB_PORT', default=3306))
        )
        cursor = conn.cursor()
        
        # Create database
        db_name = config('DB_NAME', default='pharmacy_db')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' created or already exists.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
