from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("AdminPass123!"))
print(pwd_context.hash("UserPass123!"))
