from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///database.db")
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    explanation = Column(String)
    user_id = Column(Integer)

class ProductFeature(Base):
    __tablename__ = "product_features"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    product_id = Column(Integer)

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, autoincrement=True)
    image_url = Column(String)
    product_id = Column(Integer)

class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String)
    username = Column(String, unique=True)
    password = Column(String)

Session = sessionmaker(bind=engine)

def get_db():
    db = Session()

    try:
        yield db
    finally:
        db.close()