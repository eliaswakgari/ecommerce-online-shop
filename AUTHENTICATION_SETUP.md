# Authentication Setup Guide

## Email Configuration (Forgot Password)

### Gmail Setup
1. **Enable 2-Factor Authentication**: 
   - Go to your Google Account settings
   - Enable 2-factor authentication

2. **Generate App Password**:
   - Go to Google Account > Security > App passwords
   - Select "Mail" as the app
   - Copy the generated 16-character password

3. **Update .env file**:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Alternative Email Services
You can also use other email services by updating the `service` in `sendEmail.js`:
- `hotmail` for Outlook/Hotmail
- `yahoo` for Yahoo Mail
- Or use SMTP settings for custom email providers

## Google OAuth Setup

### Google Cloud Console Setup
1. **Create Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

4. **Update .env file**:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Required Dependencies

### Backend Dependencies
Run in the backend directory:
```bash
npm install passport passport-google-oauth20 express-session nodemailer
```

### Frontend Dependencies  
Run in the frontend directory:
```bash
npm install react-icons
```

## Testing

### Email Testing
1. Update the EMAIL_USER and EMAIL_PASS in .env
2. Start the backend server
3. Go to forgot password page
4. Enter a valid email address
5. Check your email for the reset link

### Google OAuth Testing
1. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
2. Start both backend and frontend servers
3. Go to login or register page
4. Click "Continue with Google"
5. Complete Google authentication flow

## Troubleshooting

### Email Issues
- **"Invalid login"**: Make sure you're using App Password, not regular password
- **"Service unavailable"**: Check the service name in sendEmail.js
- **Emails not receiving**: Check spam folder

### Google OAuth Issues
- **"redirect_uri_mismatch"**: Make sure redirect URI matches exactly in Google Console
- **"invalid_client"**: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- **"Access blocked"**: Make sure Google+ API is enabled

## Security Notes

1. **Never commit sensitive credentials** to version control
2. **Use HTTPS in production** for OAuth redirects
3. **Regularly rotate** OAuth credentials and email passwords
4. **Monitor authentication logs** for suspicious activity