from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Comment, User, Notification, Legislation
from app.utils.sentiment import analyse_sentiment
import os, uuid

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('/', methods=['POST'])
@jwt_required()
def submit_comment():
    user_id = int(get_jwt_identity())
    text = request.form.get('text', '').strip()
    if not text or len(text) > 2000:
        return jsonify({'error': 'Comment text required (max 2000 chars)'}), 400

    legislation_id = request.form.get('legislation_id')
    provision_id = request.form.get('provision_id') or None

    attachment_path = None
    if 'attachment' in request.files:
        f = request.files['attachment']
        if f.filename:
            fname = f'{uuid.uuid4().hex}_{f.filename}'
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            attachment_path = fname

    sentiment, confidence = analyse_sentiment(text)

    comment = Comment(
        user_id=user_id, legislation_id=int(legislation_id),
        provision_id=int(provision_id) if provision_id else None,
        text=text, sentiment=sentiment, confidence=confidence,
        attachment_path=attachment_path
    )
    db.session.add(comment)
    db.session.flush()

    leg = Legislation.query.get(int(legislation_id))
    leg_title = leg.title if leg else 'a legislation'

    # Notify user: comment submitted with sentiment result
    sentiment_label = {'positive': '✅ Positive', 'negative': '❌ Negative', 'neutral': '➖ Neutral'}.get(sentiment, sentiment)
    n = Notification(
        user_id=user_id,
        type='comment_submitted',
        message=f'Your feedback on "{leg_title}" was submitted. AI analysis: {sentiment_label} ({round(confidence * 100)}% confidence).',
        legislation_id=int(legislation_id)
    )
    db.session.add(n)
    db.session.commit()

    return jsonify(comment.to_dict()), 201


@comments_bp.route('/my', methods=['GET'])
@jwt_required()
def my_comments():
    user_id = int(get_jwt_identity())
    comments = Comment.query.filter_by(user_id=user_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


@comments_bp.route('/legislation/<int:leg_id>', methods=['GET'])
def comments_by_legislation(leg_id):
    comments = Comment.query.filter_by(legislation_id=leg_id).order_by(Comment.created_at.desc()).all()
    return jsonify([c.to_dict() for c in comments]), 200
