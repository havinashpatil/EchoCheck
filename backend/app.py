from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
import re
from functools import wraps
from urllib.parse import quote
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'echocheck')

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER')

# Initialize Twilio client if credentials are available
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)



# MongoDB connection
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db['users']
contacts_collection = db['contacts']
trips_collection = db['trips']
checkins_collection = db['checkins']
sos_collection = db['sos']

# JWT Authentication Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc


# ------------------ Input Validation Helpers ------------------
def is_valid_name(name: str) -> bool:
    """Return True when name contains only letters and spaces (no extra characters)."""
    if not name or not isinstance(name, str):
        return False
    # Allow letters (A-Z, a-z) and spaces only
    return bool(re.fullmatch(r"[A-Za-z ]+", name.strip()))


def is_valid_email(email: str) -> bool:
    """Simple email format validation."""
    if not email or not isinstance(email, str):
        return False
    # Basic email regex (not exhaustive but good enough for common cases)
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w{2,}$"
    return bool(re.fullmatch(pattern, email.strip()))


def is_valid_phone(phone: str) -> bool:
    """Return True when phone consists of exactly 10 digits."""
    if phone is None:
        return False
    # Convert to string and strip whitespace
    phone_str = str(phone).strip()
    return bool(re.fullmatch(r"\d{10}", phone_str))

# ==================== AUTHENTICATION ====================

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required'}), 400

        # Validate inputs
        if not is_valid_name(name):
            return jsonify({'error': 'Invalid name. Use letters and spaces only.'}), 400
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }
        result = users_collection.insert_one(user)
        user_id = str(result.inserted_id)
        
        # Generate JWT token
        token = jwt.encode({'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=30)}, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password - handle both bytes and string formats from MongoDB
        stored_password = user['password']
        try:
            # MongoDB might store as Binary or bytes or string
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            elif hasattr(stored_password, 'decode'):  # Binary type from pymongo
                stored_password = stored_password.decode('utf-8').encode('utf-8')
            elif not isinstance(stored_password, bytes):
                # Try to convert to bytes
                stored_password = bytes(stored_password)
            
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                return jsonify({'error': 'Invalid email or password'}), 401
        except Exception as e:
            # Log the error for debugging
            print(f"Password check error: {e}")
            return jsonify({'error': 'Authentication error. Please try again.'}), 401
        
        # Generate JWT token
        user_id = str(user['_id'])
        token = jwt.encode({'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=30)}, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email']
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== TRUSTED CONTACTS ====================

@app.route('/api/contacts', methods=['GET'])
@token_required
def get_contacts(user_id):
    try:
        contacts = list(contacts_collection.find({'user_id': user_id}))
        for contact in contacts:
            serialize_doc(contact)
        return jsonify({'contacts': contacts}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contacts', methods=['POST'])
@token_required
def add_contact(user_id):
    try:
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone')
        email = data.get('email', '')
        
        if not name or not phone:
            return jsonify({'error': 'Name and phone are required'}), 400
        # Validate contact inputs
        if not is_valid_name(name):
            return jsonify({'error': 'Invalid contact name. Use letters and spaces only.'}), 400
        if not is_valid_phone(phone):
            return jsonify({'error': 'Invalid phone number. Must be exactly 10 digits.'}), 400
        if email and not is_valid_email(email):
            return jsonify({'error': 'Invalid email format for contact'}), 400
        
        contact = {
            'user_id': user_id,
            'name': name,
            'phone': phone,
            'email': email,
            'created_at': datetime.utcnow()
        }
        result = contacts_collection.insert_one(contact)
        contact['_id'] = str(result.inserted_id)
        serialize_doc(contact)
        
        return jsonify({'contact': contact}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contacts/<contact_id>', methods=['DELETE'])
@token_required
def delete_contact(user_id, contact_id):
    try:
        result = contacts_collection.delete_one({'_id': ObjectId(contact_id), 'user_id': user_id})
        if result.deleted_count == 0:
            return jsonify({'error': 'Contact not found'}), 404
        return jsonify({'message': 'Contact deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== TRIP MANAGEMENT ====================

@app.route('/api/trip', methods=['POST'])
@token_required
def create_trip(user_id):
    try:
        data = request.get_json()
        destination = data.get('destination')
        interval_minutes = int(data.get('interval_minutes', 10))
        
        if not destination:
            return jsonify({'error': 'Destination is required'}), 400
        
        # Close any existing active trips
        trips_collection.update_many(
            {'user_id': user_id, 'status': 'active'},
            {'$set': {'status': 'closed', 'ended_at': datetime.utcnow()}}
        )
        
        # Create new trip
        now = datetime.utcnow()
        trip = {
            'user_id': user_id,
            'destination': destination,
            'interval_minutes': interval_minutes,
            'started_at': now,
            'next_check_due': now + timedelta(minutes=interval_minutes),
            'status': 'active'
        }
        result = trips_collection.insert_one(trip)
        trip['_id'] = str(result.inserted_id)
        serialize_doc(trip)
        trip['started_at'] = trip['started_at'].isoformat()
        trip['next_check_due'] = trip['next_check_due'].isoformat()
        
        return jsonify({'trip': trip}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trip/active', methods=['GET'])
@token_required
def get_active_trip(user_id):
    try:
        trip = trips_collection.find_one({'user_id': user_id, 'status': 'active'})
        if not trip:
            return jsonify({'trip': None}), 200
        
        serialize_doc(trip)
        trip['started_at'] = trip['started_at'].isoformat()
        trip['next_check_due'] = trip['next_check_due'].isoformat()
        return jsonify({'trip': trip}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CHECK-IN SYSTEM ====================

@app.route('/api/checkin', methods=['POST'])
@token_required
def checkin(user_id):
    try:
        data = request.get_json()
        trip_id = data.get('trip_id')
        lat = float(data.get('lat'))
        lng = float(data.get('lng'))
        
        if not trip_id:
            return jsonify({'error': 'Trip ID is required'}), 400
        
        # Verify trip exists and belongs to user
        trip = trips_collection.find_one({'_id': ObjectId(trip_id), 'user_id': user_id, 'status': 'active'})
        if not trip:
            return jsonify({'error': 'Active trip not found'}), 404
        
        # Save check-in
        now = datetime.utcnow()
        checkin = {
            'user_id': user_id,
            'trip_id': trip_id,
            'lat': lat,
            'lng': lng,
            'timestamp': now
        }
        checkins_collection.insert_one(checkin)
        
        # Update trip's next check-in due time
        next_check_due = now + timedelta(minutes=trip['interval_minutes'])
        trips_collection.update_one(
            {'_id': ObjectId(trip_id)},
            {'$set': {'next_check_due': next_check_due}}
        )
        
        return jsonify({
            'message': 'Check-in recorded successfully',
            'next_check_due': next_check_due.isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== SOS SYSTEM ====================

@app.route('/api/sos', methods=['POST'])
@token_required
def sos(user_id):
    try:
        data = request.get_json()
        lat = data.get('lat')
        lng = data.get('lng')
        reason = data.get('reason', 'Emergency')

        # Handle optional lat/lng
        try:
            if lat is not None and str(lat).strip() != "" and str(lat).lower() != "null":
                lat = float(lat)
            else:
                lat = None
        except (ValueError, TypeError):
            lat = None

        try:
            if lng is not None and str(lng).strip() != "" and str(lng).lower() != "null":
                lng = float(lng)
            else:
                lng = None
        except (ValueError, TypeError):
            lng = None
        
        # Get user info for SMS
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        user_name = user.get('name', 'User') if user else 'User'
        
        # Save SOS event
        now = datetime.utcnow()
        sos_event = {
            'user_id': user_id,
            'reason': reason,
            'timestamp': now
        }
        if lat is not None:
            sos_event['lat'] = lat
        if lng is not None:
            sos_event['lng'] = lng
        sos_collection.insert_one(sos_event)
        
        # Get user's contacts
        contacts = list(contacts_collection.find({'user_id': user_id}))
        
        # Create Google Maps link
        google_maps_link = f"https://www.google.com/maps?q={lat},{lng}" if lat is not None and lng is not None else "Location not provided"

        # Build WhatsApp deep links as a fallback/alternative
        encoded_reason = quote(reason) if isinstance(reason, str) else ""
        whatsapp_links = []
        for contact in contacts:
            raw_phone = str(contact.get('phone', '')).replace(' ', '').replace('-', '').replace('+', '')
            # Build a basic message similar to the SMS/WhatsApp body
            location_text = f"Location: {google_maps_link}" if lat is not None and lng is not None else "Location not available"
            link_message = f"🚨 EMERGENCY SOS ALERT 🚨%0A%0A{user_name} has triggered an emergency alert!%0A%0AReason: {encoded_reason}%0A{quote(location_text)}%0A%0APlease check on them immediately!"
            whatsapp_links.append({
                'name': contact.get('name', ''),
                'phone': contact.get('phone', ''),
                'link': f"https://wa.me/{raw_phone}?text={link_message}"
            })
        contact_count = len(contacts)

        # Initialize response data
        response_data = {
            'message': 'SOS alert created',
            'google_maps_link': google_maps_link,
            'timestamp': now.isoformat(),
            'sms_enabled': False,
            'sms_results': [],
            'whatsapp_enabled': False,
            'whatsapp_results': [],
            'whatsapp_links': whatsapp_links,
            'contact_count': contact_count
        }

        # Send SMS and WhatsApp messages if Twilio is configured
        if twilio_client and contacts:
            # Prepare message
            location_text = f"Location: {google_maps_link}" if lat is not None and lng is not None else "Location not available"
            message_body = f"🚨 EMERGENCY SOS ALERT 🚨\n\n{user_name} has triggered an emergency alert!\n\nReason: {reason}\n{location_text}\n\nPlease check on them immediately!"

            # Send SMS to all contacts
            sms_results = []
            for contact in contacts:
                try:
                    message = twilio_client.messages.create(
                        body=message_body,
                        from_=TWILIO_PHONE_NUMBER,
                        to=contact['phone']
                    )
                    sms_results.append({
                        'name': contact['name'],
                        'phone': contact['phone'],
                        'status': 'sent',
                        'message_sid': message.sid
                    })
                except TwilioException as e:
                    sms_results.append({
                        'name': contact['name'],
                        'phone': contact['phone'],
                        'status': 'failed',
                        'error': str(e)
                    })

            # Send WhatsApp messages to all contacts
            whatsapp_results = []
            for contact in contacts:
                try:
                    # Format phone number for WhatsApp (remove + and add whatsapp:)
                    whatsapp_number = f"whatsapp:{contact['phone'].lstrip('+')}"
                    message = twilio_client.messages.create(
                        body=message_body,
                        from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER.lstrip('+')}",
                        to=whatsapp_number
                    )
                    whatsapp_results.append({
                        'name': contact['name'],
                        'phone': contact['phone'],
                        'status': 'sent',
                        'message_sid': message.sid
                    })
                except TwilioException as e:
                    whatsapp_results.append({
                        'name': contact['name'],
                        'phone': contact['phone'],
                        'status': 'failed',
                        'error': str(e)
                    })

            # Update response data
            response_data['sms_enabled'] = True
            response_data['sms_results'] = sms_results
            response_data['whatsapp_enabled'] = True
            response_data['whatsapp_results'] = whatsapp_results

            # Check if there were any warnings
            sms_warning = None
            whatsapp_warning = None
            if not TWILIO_PHONE_NUMBER:
                sms_warning = "Twilio phone number not configured"
                response_data['sms_enabled'] = False
            if not TWILIO_WHATSAPP_NUMBER:
                whatsapp_warning = "Twilio WhatsApp number not configured"
                response_data['whatsapp_enabled'] = False

            response_data['sms_warning'] = sms_warning
            response_data['whatsapp_warning'] = whatsapp_warning

            # General warning if both are disabled
            if not response_data['sms_enabled'] and not response_data['whatsapp_enabled']:
                response_data['warning'] = "SMS and WhatsApp are not configured. Please set up Twilio credentials in your environment variables."

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== MISSED CHECK-IN SCANNER ====================

@app.route('/api/scan_missed_checks', methods=['GET'])
@token_required
def scan_missed_checks(user_id):
    try:
        now = datetime.utcnow()
        # Find all active trips with missed check-ins
        missed_trips = list(trips_collection.find({
            'user_id': user_id,
            'status': 'active',
            'next_check_due': {'$lt': now}
        }))
        
        result = []
        for trip in missed_trips:
            serialize_doc(trip)
            trip['started_at'] = trip['started_at'].isoformat()
            trip['next_check_due'] = trip['next_check_due'].isoformat()
            
            # Calculate how many minutes overdue
            overdue_minutes = (now - trip['next_check_due']).total_seconds() / 60
            trip['overdue_minutes'] = round(overdue_minutes, 2)
            result.append(trip)
        
        return jsonify({'missed_trips': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    # Disable reloader on Windows to avoid socket errors
    # Set use_reloader=False if you encounter OSError: [WinError 10038]
    import sys
    is_windows = sys.platform.startswith('win')
    app.run(debug=True, port=5000, use_reloader=not is_windows, threaded=True)

