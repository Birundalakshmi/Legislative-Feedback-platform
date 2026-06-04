from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import User

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    uid = int(get_jwt_identity())
    user = User.query.get_or_404(uid)
    return jsonify(user.to_dict()), 200


@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    uid = int(get_jwt_identity())
    user = User.query.get_or_404(uid)
    data = request.get_json()
    for field in ['name', 'organisation', 'location', 'stakeholder_type']:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify(user.to_dict()), 200


@profile_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    uid = int(get_jwt_identity())
    user = User.query.get_or_404(uid)
    data = request.get_json()
    if not user.check_password(data.get('current_password', '')):
        return jsonify({'error': 'Current password is incorrect'}), 400
    new_pw = data.get('new_password', '')
    if len(new_pw) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    user.set_password(new_pw)
    db.session.commit()
    return jsonify({'message': 'Password updated'}), 200
