from datetime import date, timedelta
from app.extensions import db
from app.models.models import Legislation, User, Notification


def check_and_notify_deadlines():
    """Auto-create deadline notifications for consultations closing within 3 days."""
    today = date.today()
    soon = today + timedelta(days=3)

    legs = Legislation.query.filter(
        Legislation.status == 'Open',
        Legislation.end_date <= soon,
        Legislation.end_date >= today
    ).all()

    users = User.query.filter_by(is_admin=False).all()

    for leg in legs:
        days_left = (leg.end_date - today).days
        for u in users:
            exists = Notification.query.filter_by(
                user_id=u.id, type='deadline', legislation_id=leg.id
            ).first()
            if not exists:
                n = Notification(
                    user_id=u.id,
                    type='deadline',
                    message=f'⏰ Deadline alert: "{leg.title}" closes in {days_left} day(s)! Submit your feedback now.',
                    legislation_id=leg.id
                )
                db.session.add(n)

    db.session.commit()
