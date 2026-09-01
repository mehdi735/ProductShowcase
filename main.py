from fastapi import Depends, File, Form, Header, FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db, Product, ProductFeature, ProductImage, User, Base, engine
from typing import List
import os
import uuid
import json
import hashlib
import jwt
import datetime

SECRET_KEY = "This is my key B@~12345#*&^%$#$"
app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ProductCreate(BaseModel):
    name: str
    features: list[str]
    explanation: str
    images_urls: list[str]
    user_id: int

class UserRegister(BaseModel):
    full_name: str
    username: str
    password: str

class Login(BaseModel):
    username: str
    password: str

def hash_password(password:str):
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id:int, username:str, full_name:str):
    payload = {
        "user_id": user_id,
        "username": username,
        "full_name": full_name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }

    token = jwt.encode(payload=payload, key=SECRET_KEY, algorithm="HS256")
    return token

def decode_token(authorization:str):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload

@app.get("/products")
def get_all_product(db:Session=Depends(get_db)):
    product = db.query(Product).all()
    product_feature = db.query(ProductFeature).all()
    product_image = db.query(ProductImage).all()

    return {"product": product, "product_feature": product_feature, "product_image": product_image}

@app.get("/products/{id}")
def get_product_by_id(id:int, db:Session=Depends(get_db)):
    product = db.query(Product).filter_by(id=id).first()
    product_feature = db.query(ProductFeature).filter_by(product_id=id).all()
    product_image = db.query(ProductImage).filter_by(product_id=id).all()

    return {"product": product, "product_feature": product_feature, "product_image": product_image}

@app.get("/api/verify-token")
def verify_token(authorization:str=Header(...), db:Session=Depends(get_db)):
    try:
        payload = decode_token(authorization)
        user_id = payload["user_id"]

        user = db.query(User).filter_by(user_id=user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد!")

        return {"username": payload["username"], "full_name": payload["full_name"], "user_id":user_id,
                "message": f"درود بر {payload["full_name"]}"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="توکن منقضی شده")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر")

@app.post("/products")
def post_product(product_string:str=Form(...), image_files:List[UploadFile]=File(...), db:Session=Depends(get_db)):
    product = ProductCreate(**json.loads(product_string))
    new_product = Product(name=product.name, explanation=product.explanation, user_id=product.user_id)
    db.add(new_product)
    db.commit()

    for feature in product.features:
        new_feature = ProductFeature(name=feature, product_id=new_product.id)
        db.add(new_feature)

    for image in image_files:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"static/images/{filename}"

        with open(path, "wb") as i:
            i.write(image.file.read())

        product_image = ProductImage(image_url=path, product_id=new_product.id)
        db.add(product_image)

    db.commit()

    return {"message": f"created {product.name}"}

@app.post("/api/sign-up")
def post_sign_up(user: UserRegister, db:Session=Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="این نام کاربری پیش از این ثبت شده است.")

    db.add(User(full_name=user.full_name, username=user.username, password=hash_password(user.password)))
    db.commit()

    new_user = db.query(User).filter_by(username=user.username).first()

    token = create_token(new_user.user_id, user.username, user.full_name)

    return {"message": f"Hello {user.full_name}", "token": token}

@app.post("/api/login")
def post_login(user:Login, db:Session=Depends(get_db)):
    user_db = db.query(User).filter_by(username=user.username).first()
    if not user_db:
        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور نادرست هست")

    if user_db.password != hash_password(user.password):
        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور نادرست هست")

    token = create_token(user_db.user_id, user_db.username, user_db.full_name)

    return {"message": "success is True", "token": token}

@app.delete("/products")
def delete_all_product(db:Session=Depends(get_db)):
    db.query(Product).delete()
    db.query(ProductFeature).delete()
    db.query(ProductImage).delete()
    db.commit()
    return {"message": "deleted all"}

@app.post("/test")
def test(t:str=Form(...), db:Session=Depends(get_db)):
    return t