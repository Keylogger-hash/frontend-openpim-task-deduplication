from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


templates = Jinja2Templates(directory="templates")



@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,name='index.html'
    )

@app.get("/reports", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,name='reports.html'
    )

@app.get("/items/ready", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,name='ready_for_delete.html'
    )

@app.get("/items/delete", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,name='delete_items.html'
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
