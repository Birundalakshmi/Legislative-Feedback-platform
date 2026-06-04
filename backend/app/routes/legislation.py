from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Legislation, Provision, User, Notification
from datetime import date
import os, uuid

legislation_bp = Blueprint('legislation', __name__)

def admin_required():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or not user.is_admin:
        return None, jsonify({'error': 'Admin access required'}), 403
    return user, None, None


@legislation_bp.route('/', methods=['GET'])
def get_legislations():
    legs = Legislation.query.order_by(Legislation.created_at.desc()).all()
    return jsonify([l.to_dict() for l in legs]), 200


@legislation_bp.route('/<int:leg_id>', methods=['GET'])
def get_legislation(leg_id):
    leg = Legislation.query.get_or_404(leg_id)
    return jsonify(leg.to_dict(include_provisions=True)), 200


@legislation_bp.route('/pdf/<path:filename>', methods=['GET'])
def serve_pdf(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


@legislation_bp.route('/', methods=['POST'])
@jwt_required()
def create_legislation():
    user, err, code = admin_required()
    if err:
        return err, code

    title = request.form.get('title')
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    pdf_path = None
    if 'pdf' in request.files:
        f = request.files['pdf']
        if f.filename:
            fname = f'{uuid.uuid4().hex}_{f.filename}'
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            pdf_path = fname

    import json
    provisions_data = json.loads(request.form.get('provisions', '[]'))
    start = request.form.get('start_date')
    end = request.form.get('end_date')

    leg = Legislation(
        title=title,
        description=request.form.get('description'),
        ministry=request.form.get('ministry'),
        category=request.form.get('category'),
        status=request.form.get('status', 'Draft'),
        start_date=date.fromisoformat(start) if start else None,
        end_date=date.fromisoformat(end) if end else None,
        pdf_path=pdf_path
    )
    db.session.add(leg)
    db.session.flush()

    for p in provisions_data:
        prov = Provision(
            legislation_id=leg.id,
            section_number=p.get('section_number'),
            title=p.get('title'),
            text=p.get('text')
        )
        db.session.add(prov)

    db.session.commit()

    if leg.status == 'Open':
        _notify_all_users(
            'new_legislation',
            f'📋 New consultation available: "{leg.title}" ({leg.category}) — Share your feedback before the deadline!',
            leg.id
        )

    return jsonify(leg.to_dict(include_provisions=True)), 201


@legislation_bp.route('/<int:leg_id>', methods=['PUT'])
@jwt_required()
def update_legislation(leg_id):
    user, err, code = admin_required()
    if err:
        return err, code

    leg = Legislation.query.get_or_404(leg_id)
    old_status = leg.status

    if 'pdf' in request.files:
        f = request.files['pdf']
        if f.filename:
            fname = f'{uuid.uuid4().hex}_{f.filename}'
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], fname))
            leg.pdf_path = fname

    import json
    for field in ['title', 'description', 'ministry', 'category', 'status']:
        val = request.form.get(field)
        if val is not None:
            setattr(leg, field, val)

    start = request.form.get('start_date')
    end = request.form.get('end_date')
    if start:
        leg.start_date = date.fromisoformat(start)
    if end:
        leg.end_date = date.fromisoformat(end)

    provisions_raw = request.form.get('provisions')
    if provisions_raw:
        provisions_data = json.loads(provisions_raw)
        Provision.query.filter_by(legislation_id=leg.id).delete()
        for p in provisions_data:
            prov = Provision(
                legislation_id=leg.id,
                section_number=p.get('section_number'),
                title=p.get('title'),
                text=p.get('text')
            )
            db.session.add(prov)

    db.session.commit()

    if old_status != 'Closed' and leg.status == 'Closed':
        _notify_all_users(
            'legislation_closed',
            f'🔒 Consultation closed: "{leg.title}" — Thank you for your participation. Results are being analysed.',
            leg.id
        )
    if old_status != 'Open' and leg.status == 'Open':
        _notify_all_users(
            'new_legislation',
            f'📋 New consultation available: "{leg.title}" ({leg.category}) — Share your feedback before the deadline!',
            leg.id
        )

    return jsonify(leg.to_dict(include_provisions=True)), 200


@legislation_bp.route('/<int:leg_id>', methods=['DELETE'])
@jwt_required()
def delete_legislation(leg_id):
    user, err, code = admin_required()
    if err:
        return err, code
    leg = Legislation.query.get_or_404(leg_id)
    db.session.delete(leg)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200


def _notify_all_users(ntype, message, leg_id):
    users = User.query.filter_by(is_admin=False).all()
    for u in users:
        # Avoid duplicate notifications of same type for same legislation
        exists = Notification.query.filter_by(
            user_id=u.id, type=ntype, legislation_id=leg_id
        ).first()
        if not exists:
            n = Notification(user_id=u.id, type=ntype, message=message, legislation_id=leg_id)
            db.session.add(n)
    db.session.commit()
