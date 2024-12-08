from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import pydantic
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware

# connect to database

# cursor.execute('''SELECT column_name, data_type
# FROM information_schema.columns
# WHERE table_schema = 'public' AND table_name = 'items';''')
# columns = cursor.fetchall()
conn = psycopg2.connect(
    database="openpim", user='test1', password='123', host='127.0.0.1', port= '5432'
)

conn.autocommit = True
cursor = conn.cursor(cursor_factory=RealDictCursor)
async def list_tables():
    cursor.execute('''SELECT DISTINCT "typeIdentifier","name"->>'ru' as "name" FROM items;''')
    result = cursor.fetchall()
    ans = []
    for row in result:
        ans.append(dict(row))
    return ans

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")


templates = Jinja2Templates(directory="templates")

class Table(pydantic.BaseModel):
    value: str|None
    label: str|

@app.get("/tables")
async def list_tables_1():
    ans = await list_tables()
    print(ans)
    return [Table(value=row['typeIdentifier'],label=row['name']) for row in ans]

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8001, reload=True)
