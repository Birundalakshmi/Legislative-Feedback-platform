from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .extensions import db
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 604800  # 7 days
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 10485760))

    CORS(app, origins=['http://localhost:5173', 'http://localhost:5174'], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], expose_headers=['Content-Disposition', 'Content-Type'])
    db.init_app(app)
    JWTManager(app)

    from .routes.auth import auth_bp
    from .routes.legislation import legislation_bp
    from .routes.comments import comments_bp
    from .routes.admin import admin_bp
    from .routes.notifications import notifications_bp
    from .routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(legislation_bp, url_prefix='/api/legislations')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')

    with app.app_context():
        db.create_all()
        from .utils.seed import seed_admin
        seed_admin()
        # Auto-check deadlines on startup
        try:
            from .utils.deadline import check_and_notify_deadlines
            check_and_notify_deadlines()
        except Exception:
            pass

    return app
