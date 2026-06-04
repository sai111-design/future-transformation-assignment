from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mysql_host: str
    mysql_port: int = 3306
    mysql_user: str
    mysql_password: str
    mysql_db: str
    jwt_secret: str
    jwt_expire_minutes: int = 60
    upload_dir: str = "./data/uploads"
    faiss_index_path: str = "./data/faiss.index"

    class Config:
        env_file = ".env"


settings = Settings()
