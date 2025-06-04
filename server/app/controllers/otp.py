import smtplib
import random
from datetime import datetime, timedelta
import re
import logging

logger = logging.getLogger(__name__)

otp_store = {}
registration_temp_store = {}  # Temporary storage for registration data

# Configuration
OTP_EXPIRY_SECONDS = 300  # 5 minutes
OTP_SIZE = 6
SENDER_EMAIL = "ecofinds3@gmail.com"
GOOGLE_APP_PASSWORD = "xxazeeewsbbofbbz"  # Use environment variable in production

def generate_otp(otp_size=OTP_SIZE):
    """Generate a random OTP of specified size"""
    return ''.join([str(random.randint(0, 9)) for _ in range(otp_size)])  # Fixed syntax error

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def send_email_verification(receiver, otp):
    """Send OTP via email"""
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        logger.info("SMTP server started")
        server.login(SENDER_EMAIL, GOOGLE_APP_PASSWORD)
        
        subject = "Your EcoFinds OTP Verification"
        body = f"""Hello,

Your OTP for EcoFinds registration is: {otp}

This OTP is valid for {OTP_EXPIRY_SECONDS // 60} minutes only.
If you didn't request this OTP, please ignore this email.

Best regards,
EcoFinds Team"""
        
        msg = f"Subject: {subject}\n\n{body}"
        server.sendmail(SENDER_EMAIL, receiver, msg)
        server.quit()
        logger.info(f"OTP sent successfully to {receiver}")
        return True
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        return False

def cleanup_expired_otps():
    """Clean up expired OTPs from memory"""
    current_time = datetime.now()
    expired_emails = []
    
    for email, data in otp_store.items():
        if current_time - data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS):
            expired_emails.append(email)
    
    for email in expired_emails:
        del otp_store[email]
    
    # Also cleanup expired registration data
    expired_registrations = []
    for email, data in registration_temp_store.items():
        if current_time - data['timestamp'] > timedelta(seconds=OTP_EXPIRY_SECONDS * 2):  # Keep registration data longer
            expired_registrations.append(email)
    
    for email in expired_registrations:
        del registration_temp_store[email]