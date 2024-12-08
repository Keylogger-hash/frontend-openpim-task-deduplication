import psycopg2
import json

# connect to database
conn = psycopg2.connect(
    database="openpim", user='test1', password='123', host='localhost', port= '5432'
)

conn.autocommit = True
cursor = conn.cursor()

cursor.execute('''SELECT * from public.Items''')
result = cursor.fetchall()
print(result)