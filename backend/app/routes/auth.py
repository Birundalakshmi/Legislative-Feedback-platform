from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required = ['name', 'email', 'password']
    if not all(data.get(f) for f in required):
        return jsonify({'error': 'Name, email and password are required'}), 400
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    user = User(
        name=data['name'], email=data['email'],
        organisation=data.get('organisation', ''),
        location=data.get('location', ''),
        stakeholder_type=data.get('stakeholder_type', 'individual')
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.flush()

    # Notify new user about all currently open legislations
    from app.models.models import Legislation, Notification
    open_legs = Legislation.query.filter_by(status='Open').all()
    for leg in open_legs:
        n = Notification(
            user_id=user.id,
            type='new_legislation',
            message=f'📋 Consultation available: "{leg.title}" ({leg.category}) — Share your feedback before the deadline!',
            legislation_id=leg.id
        )
        db.session.add(n)

    # Also check deadlines
    from datetime import date, timedelta
    today = date.today()
    soon = today + timedelta(days=3)
    for leg in open_legs:
        if leg.end_date and leg.end_date <= soon and leg.end_date >= today:
            days_left = (leg.end_date - today).days
            n = Notification(
                user_id=user.id,
                type='deadline',
                message=f'⏰ Deadline alert: "{leg.title}" closes in {days_left} day(s)! Submit your feedback now.',
                legislation_id=leg.id
            )
            db.session.add(n)

    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.check_password(data.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))

    # Trigger deadline notifications on login for public users
    if not user.is_admin:
        try:
            from app.utils.deadline import check_and_notify_deadlines
            check_and_notify_deadlines()
            # Also ensure user has notifications for all open legislations
            from app.models.models import Legislation, Notification
            open_legs = Legislation.query.filter_by(status='Open').all()
            from app.extensions import db
            for leg in open_legs:
                exists = Notification.query.filter_by(
                    user_id=user.id, type='new_legislation', legislation_id=leg.id
                ).first()
                if not exists:
                    n = Notification(
                        user_id=user.id,
                        type='new_legislation',
                        message=f'📋 Consultation available: "{leg.title}" ({leg.category}) — Share your feedback before the deadline!',
                        legislation_id=leg.id
                    )
                    db.session.add(n)
            db.session.commit()
        except Exception:
            pass

    return jsonify({'token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return jsonify({'message': 'If that email exists, a reset link has been sent (demo mode)'}), 200


@auth_bp.route('/me', methods=['GET'])
def me():
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict()}), 200
    except Exception:
        return jsonify({'error': 'Unauthorized'}), 401
