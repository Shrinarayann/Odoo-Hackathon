from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import smtplib

app = Flask(__name__)
CORS(app)

# In-memory OTP storage
otp_store = {}

def generate_otp(otp_size=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(otp_size)])

def send_email_verification(sender, receiver, otp):
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        google_app_password = "omrtxudmmdjynfdd"  # Replace with your actual app password
        server.login(sender, google_app_password)
        msg = f"Hello, Your OTP is {otp}"
        server.sendmail(sender, receiver, msg)
        server.quit()
        return True
    except Exception as e:
        print("Email send error:", e)
        return False

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    otp = generate_otp()
    otp_store[email] = otp

    sender_email = "ecofinds3@gmail.com"  # Your sender Gmail
    if send_email_verification(sender_email, email, otp):
        return jsonify({'success': True, 'message': 'OTP sent successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp_input = data.get('otp')

    if not email or not otp_input:
        return jsonify({'success': False, 'message': 'Email and OTP required'}), 400

    if otp_store.get(email) == otp_input:
        del otp_store[email]
        return jsonify({'success': True, 'message': 'OTP verified'})
    else:
        return jsonify({'success': False, 'message': 'Invalid OTP'}), 401

if __name__ == '__main__':
    app.run(debug=True)


'''from flask import Flask, request, jsonify
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

print("Starting Flask app with /send-otp and /verify-otp routes")

# Utility to generate random 6-digit OTP
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

@app.route('/')
def index():
    print("Root endpoint '/' hit")
    return "Server is up and running!"

@app.route('/send-otp', methods=['POST'])
def send_otp():
    print("send_otp endpoint hit")
    data = request.get_json()
    email = data.get('email')
    print(f"Received email: {email}")

    if not email:
        print("No email provided in request")
        return jsonify({'error': 'Email is required'}), 400

    otp = generate_otp()
    otp_store[email] = {'otp': otp, 'timestamp': time.time()}
    print(f"Generated OTP: {otp} for email: {email}")

    try:
        msg = Message(subject='Your OTP for EcoFinds',
                      recipients=[email],
                      body=f'Your OTP is: {otp}\nIt is valid for 5 minutes.')
        mail.send(msg)
        print("OTP email sent successfully")
        return jsonify({'message': 'OTP sent successfully'}), 200
    except Exception as e:
        print("Error sending email:", str(e))
        return jsonify({'error': 'Failed to send OTP'}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    print("verify_otp endpoint hit")
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    print(f"Verifying OTP {otp} for email {email}")

    if not email or not otp:
        print("Email or OTP missing in request")
        return jsonify({'error': 'Email and OTP are required'}), 400

    record = otp_store.get(email)

    if not record:
        print("No OTP record found for email")
        return jsonify({'error': 'No OTP found for this email'}), 400

    if time.time() - record['timestamp'] > OTP_EXPIRY_SECONDS:
        print("OTP expired")
        return jsonify({'error': 'OTP expired'}), 400

    if record['otp'] != otp:
        print("Invalid OTP provided")
        return jsonify({'error': 'Invalid OTP'}), 400

    otp_store.pop(email)  # Optional: clear OTP after successful verification
    print("OTP verified successfully")
    return jsonify({'message': 'OTP verified successfully'}), 200

if __name__ == '__main__':
    print(app.url_map)  # Print all registered routes
    app.run(debug=True)
'''