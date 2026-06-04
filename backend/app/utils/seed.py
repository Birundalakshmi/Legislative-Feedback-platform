from app.models.models import User
from app.extensions import db

def seed_admin():
    if not User.query.filter_by(email='admin@lawlytics.gov.in').first():
        admin = User(name='Admin', email='admin@lawlytics.gov.in', is_admin=True,
                     organisation='Government of India', location='New Delhi', stakeholder_type='individual')
        admin.set_password('admin123')
        db.session.add(admin)

    if not User.query.filter_by(email='user@lawlytics.gov.in').first():
        user = User(name='Demo User', email='user@lawlytics.gov.in', is_admin=False,
                    organisation='Civil Society', location='Mumbai', stakeholder_type='individual')
        user.set_password('user123')
        db.session.add(user)

    db.session.commit()
