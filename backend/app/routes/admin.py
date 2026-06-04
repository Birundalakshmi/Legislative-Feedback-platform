from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Comment, Legislation, User, Provision, Notification
from app.utils.summariser import summarise_comments, extract_keywords
from sqlalchemy import func
from datetime import date, timedelta, datetime, timezone
import io

admin_bp = Blueprint('admin', __name__)


def require_admin():
    uid = int(get_jwt_identity())
    u = User.query.get(uid)
    if not u or not u.is_admin:
        return None, (jsonify({'error': 'Admin required'}), 403)
    return u, None


# ── Dashboard metrics ──────────────────────────────────────────────────────────
@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    _, err = require_admin()
    if err: return err

    total = Comment.query.count()
    pos = Comment.query.filter_by(sentiment='positive').count()
    neg = Comment.query.filter_by(sentiment='negative').count()
    neu = Comment.query.filter_by(sentiment='neutral').count()
    active = Legislation.query.filter_by(status='Open').count()

    recent = Comment.query.order_by(Comment.created_at.desc()).limit(5).all()

    active_legs = Legislation.query.filter_by(status='Open').all()
    today = date.today()
    legs_data = []
    for l in active_legs:
        days_left = (l.end_date - today).days if l.end_date else None
        total_days = (l.end_date - l.start_date).days if l.end_date and l.start_date else 1
        elapsed = (today - l.start_date).days if l.start_date else 0
        progress = min(100, int(elapsed / total_days * 100)) if total_days > 0 else 0
        legs_data.append({**l.to_dict(), 'days_left': days_left, 'progress': progress})

    # AI summary for most-commented legislation
    most_commented = (db.session.query(Legislation.id, func.count(Comment.id).label('cnt'))
                      .join(Comment).group_by(Legislation.id)
                      .order_by(func.count(Comment.id).desc()).first())
    summary = ''
    if most_commented:
        texts = [c.text for c in Comment.query.filter_by(legislation_id=most_commented[0]).all()]
        summary = summarise_comments(texts)

    # Flagged provisions (>50% negative)
    flagged = _get_flagged_provisions()

    return jsonify({
        'total_comments': total, 'positive': pos, 'negative': neg, 'neutral': neu,
        'active_consultations': active,
        'recent_comments': [c.to_dict() for c in recent],
        'active_legislations': legs_data,
        'ai_summary': summary,
        'flagged_provisions': flagged
    }), 200


def _get_flagged_provisions():
    provisions = Provision.query.all()
    flagged = []
    for p in provisions:
        comments = Comment.query.filter_by(provision_id=p.id).all()
        if not comments:
            continue
        neg_count = sum(1 for c in comments if c.sentiment == 'negative')
        if neg_count / len(comments) > 0.5:
            flagged.append({'provision_id': p.id, 'section_number': p.section_number,
                            'title': p.title, 'legislation_id': p.legislation_id})
    return flagged


# ── Comments dashboard ─────────────────────────────────────────────────────────
@admin_bp.route('/comments', methods=['GET'])
@jwt_required()
def admin_comments():
    _, err = require_admin()
    if err: return err

    q = Comment.query.join(User).join(Legislation)

    leg_id = request.args.get('legislation_id')
    sentiment = request.args.get('sentiment')
    role = request.args.get('role')
    search = request.args.get('search')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    page = int(request.args.get('page', 1))
    per_page = 10

    if leg_id:
        q = q.filter(Comment.legislation_id == int(leg_id))
    if sentiment:
        q = q.filter(Comment.sentiment == sentiment)
    if role:
        q = q.filter(User.stakeholder_type == role)
    if search:
        q = q.filter(Comment.text.ilike(f'%{search}%'))
    if from_date:
        q = q.filter(Comment.created_at >= from_date)
    if to_date:
        q = q.filter(Comment.created_at <= to_date + ' 23:59:59')

    total = q.count()
    comments = q.order_by(Comment.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'comments': [c.to_dict() for c in comments],
        'total': total, 'page': page, 'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }), 200


# ── Sentiment analysis ─────────────────────────────────────────────────────────
@admin_bp.route('/sentiment/<int:leg_id>', methods=['GET'])
@jwt_required()
def sentiment_analysis(leg_id):
    _, err = require_admin()
    if err: return err

    comments = Comment.query.filter_by(legislation_id=leg_id).all()
    if not comments:
        return jsonify({'error': 'No comments found'}), 404

    pos = [c for c in comments if c.sentiment == 'positive']
    neg = [c for c in comments if c.sentiment == 'negative']
    neu = [c for c in comments if c.sentiment == 'neutral']
    total = len(comments)
    avg_conf = round(sum(c.confidence for c in comments) / total, 4) if total else 0

    # Provision-wise breakdown
    provisions = Provision.query.filter_by(legislation_id=leg_id).all()
    provision_data = []
    for p in provisions:
        pc = [c for c in comments if c.provision_id == p.id]
        provision_data.append({
            'section_number': p.section_number, 'title': p.title,
            'positive': sum(1 for c in pc if c.sentiment == 'positive'),
            'negative': sum(1 for c in pc if c.sentiment == 'negative'),
            'neutral': sum(1 for c in pc if c.sentiment == 'neutral'),
        })

    # Role-wise breakdown
    roles = ['individual', 'legal', 'industry', 'ngo', 'academic']
    role_data = []
    for r in roles:
        rc = [c for c in comments if c.author and c.author.stakeholder_type == r]
        role_data.append({
            'role': r,
            'positive': sum(1 for c in rc if c.sentiment == 'positive'),
            'negative': sum(1 for c in rc if c.sentiment == 'negative'),
            'neutral': sum(1 for c in rc if c.sentiment == 'neutral'),
        })

    top_pos = sorted(pos, key=lambda c: c.confidence, reverse=True)[:2]
    top_neg = sorted(neg, key=lambda c: c.confidence, reverse=True)[:2]

    keywords = extract_keywords([c.text for c in comments])
    summary = summarise_comments([c.text for c in comments])
    flagged = _get_flagged_provisions()

    return jsonify({
        'total': total, 'positive': len(pos), 'negative': len(neg), 'neutral': len(neu),
        'avg_confidence': avg_conf,
        'provision_data': provision_data,
        'role_data': role_data,
        'top_positive': [c.to_dict() for c in top_pos],
        'top_negative': [c.to_dict() for c in top_neg],
        'keywords': keywords,
        'summary': summary,
        'flagged_provisions': [f for f in flagged if f['legislation_id'] == leg_id]
    }), 200


# ── Summary report ─────────────────────────────────────────────────────────────
@admin_bp.route('/report/<int:leg_id>', methods=['GET'])
@jwt_required()
def summary_report(leg_id):
    _, err = require_admin()
    if err: return err

    leg = Legislation.query.get_or_404(leg_id)
    comments = Comment.query.filter_by(legislation_id=leg_id).all()
    total = len(comments)
    pos = sum(1 for c in comments if c.sentiment == 'positive')
    neg = sum(1 for c in comments if c.sentiment == 'negative')
    neu = sum(1 for c in comments if c.sentiment == 'neutral')

    provisions = Provision.query.filter_by(legislation_id=leg_id).all()
    prov_data = []
    for p in provisions:
        pc = [c for c in comments if c.provision_id == p.id]
        pt = len(pc)
        pp = sum(1 for c in pc if c.sentiment == 'positive')
        pn = sum(1 for c in pc if c.sentiment == 'negative')
        pnu = sum(1 for c in pc if c.sentiment == 'neutral')
        prov_data.append({
            'section_number': p.section_number, 'title': p.title,
            'total': pt, 'positive': pp, 'negative': pn, 'neutral': pnu,
            'high_negative': pn / pt > 0.5 if pt else False,
            'mostly_positive': pp / pt > 0.5 if pt else False,
        })

    summary = summarise_comments([c.text for c in comments])

    return jsonify({
        'legislation': leg.to_dict(),
        'total': total, 'positive': pos, 'negative': neg, 'neutral': neu,
        'summary': summary,
        'provisions': prov_data
    }), 200


# ── Export Excel ───────────────────────────────────────────────────────────────
@admin_bp.route('/export/excel', methods=['GET'])
@jwt_required()
def export_excel():
    _, err = require_admin()
    if err: return err

    import openpyxl
    leg_id = request.args.get('legislation_id')
    q = Comment.query
    if leg_id:
        q = q.filter_by(legislation_id=int(leg_id))
    comments = q.all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Comments'
    ws.append(['#', 'User', 'Role', 'Legislation', 'Provision', 'Comment', 'Sentiment', 'Confidence', 'Date'])
    for i, c in enumerate(comments, 1):
        ws.append([
            i, c.author.name if c.author else '', c.author.stakeholder_type if c.author else '',
            c.legislation.title if c.legislation else '',
            f"{c.provision.section_number}: {c.provision.title}" if c.provision else 'General',
            c.text, c.sentiment, c.confidence, c.created_at.strftime('%Y-%m-%d')
        ])

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    resp = make_response(buf.read())
    resp.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    resp.headers['Content-Disposition'] = 'attachment; filename=comments.xlsx'
    resp.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return resp


# ── Export PDF ─────────────────────────────────────────────────────────────────
@admin_bp.route('/export/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    _, err = require_admin()
    if err: return err

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors

        leg_id = request.args.get('legislation_id')
        q = Comment.query
        if leg_id:
            q = q.filter_by(legislation_id=int(leg_id))
        comments = q.all()

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4)
        styles = getSampleStyleSheet()
        story = [Paragraph('Lawlytics - Comments Report', styles['Title']), Spacer(1, 12)]

        data = [['#', 'User', 'Sentiment', 'Comment', 'Date']]
        for i, c in enumerate(comments, 1):
            data.append([
                str(i),
                c.author.name if c.author else '',
                c.sentiment,
                c.text[:100],
                c.created_at.strftime('%Y-%m-%d')
            ])

        t = Table(data, colWidths=[25, 80, 60, 250, 70])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
            ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t)
        doc.build(story)
        buf.seek(0)

        resp = make_response(buf.read())
        resp.headers['Content-Type'] = 'application/pdf'
        resp.headers['Content-Disposition'] = 'attachment; filename=comments.pdf'
        return resp
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Deadline notifications (called by scheduler or manually) ──────────────────
@admin_bp.route('/check-deadlines', methods=['POST'])
@jwt_required()
def check_deadlines():
    _, err = require_admin()
    if err: return err

    today = date.today()
    soon = today + timedelta(days=3)
    legs = Legislation.query.filter(
        Legislation.status == 'Open',
        Legislation.end_date <= soon,
        Legislation.end_date >= today
    ).all()

    users = User.query.filter_by(is_admin=False).all()
    count = 0
    for leg in legs:
        days_left = (leg.end_date - today).days
        for u in users:
            exists = Notification.query.filter_by(
                user_id=u.id, type='deadline', legislation_id=leg.id
            ).first()
            if not exists:
                n = Notification(
                    user_id=u.id, type='deadline',
                    message=f'⏰ Deadline alert: "{leg.title}" closes in {days_left} day(s)! Submit your feedback now.',
                    legislation_id=leg.id
                )
                db.session.add(n)
                count += 1
    db.session.commit()
    return jsonify({'created': count}), 200
