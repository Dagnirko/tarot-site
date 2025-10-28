from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "my_secret_key")
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BlockContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # text, heading, image, quote, video, html
    content: Dict[str, Any]
    order: int

class Page(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    blocks: List[BlockContent] = []
    published: bool = False
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PageCreate(BaseModel):
    title: str
    slug: str
    blocks: List[BlockContent] = []
    published: bool = False
    order: int = 0

class PageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    blocks: Optional[List[BlockContent]] = None
    published: Optional[bool] = None
    order: Optional[int] = None

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    url: str
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MenuItemCreate(BaseModel):
    label: str
    url: str
    order: int = 0

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    theme: str = "light"  # light or mystical
    site_title: str = "Таролог-Астролог"
    site_description: str = ""
    admin_email: Optional[EmailStr] = None
    social_links: Dict[str, str] = {}
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    site_title: Optional[str] = None
    site_description: Optional[str] = None
    admin_email: Optional[EmailStr] = None
    social_links: Optional[Dict[str, str]] = None

class MediaItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    url: str
    type: str  # image, file
    size: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str  # HTML content
    excerpt: Optional[str] = ""  # Short description
    image_url: Optional[str] = ""
    tags: List[str] = []
    published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = ""
    image_url: Optional[str] = ""
    tags: List[str] = []
    published: bool = False

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

class HomePageContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "home_page_content"
    hero_title: str = "Добро пожаловать"
    hero_subtitle: str = ""
    hero_image: Optional[str] = ""
    sections: List[Dict[str, Any]] = []  # Flexible sections for home page
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HomePageContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image: Optional[str] = None
    sections: Optional[List[Dict[str, Any]]] = None

# ============= UTILITIES =============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def send_email_notification(to_email: str, subject: str, content: str):
    """Send email via SendGrid"""
    sendgrid_key = os.getenv('SENDGRID_API_KEY')
    sender_email = os.getenv('SENDER_EMAIL')
    
    if not sendgrid_key or not sender_email:
        logging.warning("SendGrid not configured, skipping email")
        return False
    
    try:
        message = Mail(
            from_email=sender_email,
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        return False

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    password_hash = pwd_context.hash(user_data.password)
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"username": credentials.username})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": credentials.username})
    return Token(access_token=access_token)

@api_router.get("/auth/me")
async def get_current_user(username: str = Depends(verify_token)):
    user_doc = await db.users.find_one({"username": username}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc

# ============= PUBLIC ROUTES =============

@api_router.get("/pages", response_model=List[Page])
async def get_published_pages():
    pages = await db.pages.find({"published": True}, {"_id": 0}).sort("order", 1).to_list(100)
    for page in pages:
        if isinstance(page.get('created_at'), str):
            page['created_at'] = datetime.fromisoformat(page['created_at'])
        if isinstance(page.get('updated_at'), str):
            page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return pages

@api_router.get("/pages/{slug}", response_model=Page)
async def get_page_by_slug(slug: str):
    page = await db.pages.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    if isinstance(page.get('created_at'), str):
        page['created_at'] = datetime.fromisoformat(page['created_at'])
    if isinstance(page.get('updated_at'), str):
        page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return page

@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu_items():
    items = await db.menu_items.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        default_settings = Settings()
        return default_settings
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.post("/contact", response_model=Contact)
async def create_contact(contact_data: ContactCreate):
    contact = Contact(**contact_data.model_dump())
    
    doc = contact.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    
    # Send email notification to admin
    settings = await db.settings.find_one({"id": "site_settings"})
    if settings and settings.get('admin_email'):
        email_content = f"""
        <html>
            <body>
                <h2>Новое сообщение с сайта</h2>
                <p><strong>Имя:</strong> {contact.name}</p>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Сообщение:</strong></p>
                <p>{contact.message}</p>
            </body>
        </html>
        """
        send_email_notification(
            to_email=settings['admin_email'],
            subject="Новое сообщение с сайта",
            content=email_content
        )
    
    return contact

# ============= ADMIN ROUTES =============

@api_router.get("/admin/pages", response_model=List[Page])
async def get_all_pages():
    pages = await db.pages.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    for page in pages:
        if isinstance(page.get('created_at'), str):
            page['created_at'] = datetime.fromisoformat(page['created_at'])
        if isinstance(page.get('updated_at'), str):
            page['updated_at'] = datetime.fromisoformat(page['updated_at'])
    return pages

@api_router.post("/admin/pages", response_model=Page)
async def create_page(page_data: PageCreate):
    # Check if slug exists
    existing = await db.pages.find_one({"slug": page_data.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Page with this slug already exists")
    
    page = Page(**page_data.model_dump())
    doc = page.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.pages.insert_one(doc)
    return page

@api_router.put("/admin/pages/{page_id}", response_model=Page)
async def update_page(page_id: str, page_data: PageUpdate):
    existing = await db.pages.find_one({"id": page_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")
    
    update_dict = {k: v for k, v in page_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.pages.update_one({"id": page_id}, {"$set": update_dict})
    
    updated_page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if isinstance(updated_page.get('created_at'), str):
        updated_page['created_at'] = datetime.fromisoformat(updated_page['created_at'])
    if isinstance(updated_page.get('updated_at'), str):
        updated_page['updated_at'] = datetime.fromisoformat(updated_page['updated_at'])
    return updated_page

@api_router.delete("/admin/pages/{page_id}")
async def delete_page(page_id: str):
    result = await db.pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted successfully"}

@api_router.post("/admin/menu", response_model=MenuItem)
async def create_menu_item(item_data: MenuItemCreate):
    item = MenuItem(**item_data.model_dump())
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.menu_items.insert_one(doc)
    return item

@api_router.delete("/admin/menu/{item_id}")
async def delete_menu_item(item_id: str):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted successfully"}

@api_router.get("/admin/contacts", response_model=List[Contact])
async def get_contacts():
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for contact in contacts:
        if isinstance(contact.get('created_at'), str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    return contacts

@api_router.put("/admin/contacts/{contact_id}/read")
async def mark_contact_read(contact_id: str):
    await db.contacts.update_one({"id": contact_id}, {"$set": {"read": True}})
    return {"message": "Contact marked as read"}

@api_router.put("/admin/settings", response_model=Settings)
async def update_settings(settings_data: SettingsUpdate):
    update_dict = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": update_dict},
        upsert=True
    )
    
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.post("/admin/media", response_model=MediaItem)
async def upload_media(file_data: Dict[str, Any]):
    """Upload media as base64"""
    media_item = MediaItem(
        filename=file_data.get("filename", "unknown"),
        url=file_data.get("url", ""),
        type=file_data.get("type", "image"),
        size=file_data.get("size", 0)
    )
    
    doc = media_item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.media.insert_one(doc)
    return media_item

@api_router.get("/admin/media", response_model=List[MediaItem])
async def get_media():
    media = await db.media.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for item in media:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return media

# ============= BLOG ROUTES =============

@api_router.get("/blog", response_model=List[BlogPost])
async def get_published_blog_posts():
    """Get all published blog posts for public view"""
    posts = await db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

@api_router.get("/blog/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    """Get a single published blog post"""
    post = await db.blog_posts.find_one({"id": post_id, "published": True}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return post

@api_router.get("/admin/blog", response_model=List[BlogPost])
async def get_all_blog_posts():
    """Get all blog posts (including drafts) for admin"""
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    return posts

@api_router.post("/admin/blog", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate):
    """Create a new blog post"""
    post = BlogPost(**post_data.model_dump())
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_posts.insert_one(doc)
    return post

@api_router.put("/admin/blog/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostUpdate):
    """Update a blog post"""
    existing = await db.blog_posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_dict = {k: v for k, v in post_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_dict})
    
    updated_post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated_post.get('created_at'), str):
        updated_post['created_at'] = datetime.fromisoformat(updated_post['created_at'])
    if isinstance(updated_post.get('updated_at'), str):
        updated_post['updated_at'] = datetime.fromisoformat(updated_post['updated_at'])
    return updated_post

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str):
    """Delete a blog post"""
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# ============= HOME PAGE CONTENT ROUTES =============

@api_router.get("/home-content", response_model=HomePageContent)
async def get_home_content():
    """Get home page content"""
    content = await db.home_page_content.find_one({"id": "home_page_content"}, {"_id": 0})
    if not content:
        # Return default content
        default_content = HomePageContent()
        return default_content
    if isinstance(content.get('updated_at'), str):
        content['updated_at'] = datetime.fromisoformat(content['updated_at'])
    return content

@api_router.put("/admin/home-content", response_model=HomePageContent)
async def update_home_content(content_data: HomePageContentUpdate):
    """Update home page content"""
    update_dict = {k: v for k, v in content_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.home_page_content.update_one(
        {"id": "home_page_content"},
        {"$set": update_dict},
        upsert=True
    )
    
    content = await db.home_page_content.find_one({"id": "home_page_content"}, {"_id": 0})
    if isinstance(content.get('updated_at'), str):
        content['updated_at'] = datetime.fromisoformat(content['updated_at'])
    return content

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()