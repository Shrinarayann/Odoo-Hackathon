from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_cors import CORS
import random
import string
import time

app = Flask(__name__)
CORS(app)  # Allow CORS for frontend communication

# Configure mail settings (Use your email credentials or SMTP server)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'ecofinds3@gmail.com'
app.config['MAIL_PASSWORD'] = 'omrtxudmmdjynfdd'  # Remove spaces
app.config['MAIL_DEFAULT_SENDER'] = 'ecofinds3@gmail.com'
mail = Mail(app)

# In-memory store for OTPs (replace with DB or Redis for production)
otp_store = {}  # { email: { 'otp': '123456', 'timestamp': 1234567890 } }
OTP_EXPIRY_SECONDS = 300  # 5 minutes

# Utility to generate random 6-digit OTP
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    otp = generate_otp()
    otp_store[email] = {'otp': otp, 'timestamp': time.time()}

    try:
        msg = Message(subject='Your OTP for EcoFinds',
                      recipients=[email],
                      body=f'Your OTP is: {otp}\nIt is valid for 5 minutes.')
        mail.send(msg)
        return jsonify({'message': 'OTP sent successfully'}), 200
    except Exception as e:
        print("Error sending email:", str(e))
        return jsonify({'error': 'Failed to send OTP'}), 500


@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400

    record = otp_store.get(email)

    if not record:
        return jsonify({'error': 'No OTP found for this email'}), 400

    if time.time() - record['timestamp'] > OTP_EXPIRY_SECONDS:
        return jsonify({'error': 'OTP expired'}), 400

    if record['otp'] != otp:
        return jsonify({'error': 'Invalid OTP'}), 400

    # OTP is valid
    otp_store.pop(email)  # Optional: clear OTP after successful verification
    return jsonify({'message': 'OTP verified successfully'}), 200


if __name__ == '__main__':
    app.run(debug=True)
