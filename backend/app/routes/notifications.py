from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Notification

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    uid = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=uid).order_by(Notification.created_at.desc()).limit(50).all()
    unread = Notification.query.filter_by(user_id=uid, is_read=False).count()
    return jsonify({'notifications': [n.to_dict() for n in notifs], 'unread_count': unread}), 200


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    uid = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=uid, is_read=False).count()
    return jsonify({'unread_count': count}), 200


@notifications_bp.route('/<int:nid>/read', methods=['PUT'])
@jwt_required()
def mark_read(nid):
    uid = int(get_jwt_identity())
    n = Notification.query.filter_by(id=nid, user_id=uid).first_or_404()
    n.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    uid = int(get_jwt_identity())
    Notification.query.filter_by(user_id=uid, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All marked as read'}), 200
