import psycopg2

# Connect using the right credentials
conn = psycopg2.connect(dbname="postgres", user="nationalpark", password="nationalpark", host="localhost")
db = conn.cursor()

# Test query
db.execute("SELECT 1")
result = db.fetchone()
print(result)

conn.close()