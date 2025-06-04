from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime,timedelta
import smtplib

app = Flask(__name__)
CORS(app)

# In-memory OTP storage
otp_store = {}
OTP_EXPIRY_SECONDS = 2
def generate_otp(otp_size=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(otp_size)])

def send_email_verification(receiver, otp):
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        print("SERVER STARTED")

        sender_email = "ecofinds3@gmail.com"
        google_app_password = "xxazeeewsbbofbbz"  # Replace with your app password
        server.login(sender_email, google_app_password)
        subject = "Your EcoFinds OTP"
        body = f"Hello,\n\nYour OTP is: {otp}\n\nEcoFinds Team"
        msg = f"Subject: {subject}\n\n{body}"
        server.sendmail(sender_email, receiver, msg)
        server.quit()
        return True
    except Exception as e:
        print("Email send error:", e)
        return False

@app.route('/api/v1/auth/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    otp = generate_otp()
    otp_store[email] = {
        'otp': otp,
        'timestamp': datetime.now()
    }

    if send_email_verification(email, otp):
        return jsonify({'success': True, 'message': 'OTP sent successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

@app.route('/api/v1/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp_input = data.get('otp')

    if not email or not otp_input:
        return jsonify({'success': False, 'message': 'Email and OTP required'}), 400

    stored_data = otp_store.get(email)
    if not stored_data:
        return jsonify({'success': False, 'message': 'OTP not found'}), 404

    if datetime.now() - stored_data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS):
        del otp_store[email]
        return jsonify({'success': False, 'message': 'OTP expired'}), 401

    if stored_data['otp'] == otp_input:
        del otp_store[email]
        return jsonify({'success': True, 'message': 'OTP verified'})
    else:
        return jsonify({'success': False, 'message': 'Invalid OTP'}), 401


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)