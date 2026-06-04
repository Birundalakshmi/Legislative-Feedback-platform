from app.extensions import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    organisation = db.Column(db.String(150))
    location = db.Column(db.String(150))
    stakeholder_type = db.Column(db.String(50), default='individual')
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    comments = db.relationship('Comment', backref='author', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email,
            'organisation': self.organisation, 'location': self.location,
            'stakeholder_type': self.stakeholder_type, 'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }


class Legislation(db.Model):
    __tablename__ = 'legislations'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text)
    ministry = db.Column(db.String(150))
    category = db.Column(db.String(50))
    status = db.Column(db.String(20), default='Draft')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    pdf_path = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    provisions = db.relationship('Provision', backref='legislation', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='legislation', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_provisions=False):
        d = {
            'id': self.id, 'title': self.title, 'description': self.description,
            'ministry': self.ministry, 'category': self.category, 'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'pdf_path': self.pdf_path, 'created_at': self.created_at.isoformat(),
            'comment_count': len(self.comments)
        }
        if include_provisions:
            d['provisions'] = [p.to_dict() for p in self.provisions]
        return d


class Provision(db.Model):
    __tablename__ = 'provisions'
    id = db.Column(db.Integer, primary_key=True)
    legislation_id = db.Column(db.Integer, db.ForeignKey('legislations.id'), nullable=False)
    section_number = db.Column(db.String(20))
    title = db.Column(db.String(200))
    text = db.Column(db.Text)
    comments = db.relationship('Comment', backref='provision', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'legislation_id': self.legislation_id,
            'section_number': self.section_number, 'title': self.title,
            'text': self.text, 'comment_count': len(self.comments)
        }


class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    legislation_id = db.Column(db.Integer, db.ForeignKey('legislations.id'), nullable=False)
    provision_id = db.Column(db.Integer, db.ForeignKey('provisions.id'), nullable=True)
    text = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), default='neutral')
    confidence = db.Column(db.Float, default=0.0)
    attachment_path = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'user_id': self.user_id, 'legislation_id': self.legislation_id,
            'provision_id': self.provision_id, 'text': self.text,
            'sentiment': self.sentiment, 'confidence': self.confidence,
            'attachment_path': self.attachment_path,
            'created_at': self.created_at.isoformat(),
            'user': self.author.to_dict() if self.author else None,
            'provision': self.provision.to_dict() if self.provision else None,
            'legislation_title': self.legislation.title if self.legislation else None,
            'legislation_status': self.legislation.status if self.legislation else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50))
    message = db.Column(db.Text)
    legislation_id = db.Column(db.Integer, nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'user_id': self.user_id, 'type': self.type,
            'message': self.message, 'legislation_id': self.legislation_id,
            'is_read': self.is_read, 'created_at': self.created_at.isoformat()
        }
