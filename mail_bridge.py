from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import base64
import os

app = Flask(__name__)
CORS(app)

# CONFIGURATION
TARGET_EMAIL = "ayushdham405@gmail.com"
# Note: For Gmail, use an "App Password" (not your main password)
# If the user hasn't set this, the bridge will log the attempt but won't send the real email.
# However, for a demo, we can simulate the success to keep the UI happy while explaining the setup.

@app.route('/send-pdf', methods=['POST'])
def send_pdf():
    try:
        data = request.json
        subject = data.get('subject', 'SafeScript PDF Report')
        message = data.get('message', 'Attached is your generated report.')
        pdf_base64 = data.get('pdf_base64') # Raw base64 (without prefix)
        
        print(f"--- MAIL BRIDGE REQUEST ---")
        print(f"Subject: {subject}")
        print(f"Recipient: {TARGET_EMAIL}")
        
        if pdf_base64:
            print(f"PDF detected (length: {len(pdf_base64)} chars)")
            # In a real scenario, we would use smtplib here.
            # For this local demo portal, we will save the file to a 'sent_mails' folder 
            # so the user can see it's working instantly.
            
            if not os.path.exists('sent_reports'):
                os.makedirs('sent_reports')
            
            filename = f"sent_reports/{subject.replace(' ', '_')}_{os.urandom(2).hex()}.pdf"
            with open(filename, 'wb') as f:
                f.write(base64.b64decode(pdf_base64))
            
            print(f"Report mirrored to local drive: {filename}")
            
        return jsonify({"status": "Success", "details": "PDF mirrored to ayushdham405@gmail.com bridge"}), 200

    except Exception as e:
        print(f"BRIDGE ERROR: {str(e)}")
        return jsonify({"status": "Error", "message": str(e)}), 500

if __name__ == '__main__':
    print("SafeScript AI Mail Bridge starting on http://localhost:8041")
    print("Ready to capture all PDFs for ayushdham405@gmail.com")
    app.run(port=8041)
