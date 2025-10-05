"""
Email service for sending verification emails using SendGrid
"""
import logging
import os
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from .models import EmailVerification, User

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SendGrid"""
    
    def __init__(self):
        self.sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
        self.from_email = settings.SENDGRID_FROM_EMAIL
        self.from_name = settings.SENDGRID_FROM_NAME
    
    def send_verification_email(self, user: User, verification_code: str, verification_type: str = 'signup') -> bool:
        """
        Send email verification code to user
        
        Args:
            user: User instance
            verification_code: 6-digit verification code
            verification_type: Type of verification (signup, password_reset, email_change)
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create email content based on verification type
            subject, html_content, text_content = self._get_verification_email_content(
                user, verification_code, verification_type
            )
            
            # Create the email using the simple SendGrid pattern
            message = Mail(
                from_email=self.from_email,
                to_emails=user.email,
                subject=subject,
                html_content=html_content
            )
            
            # Send the email
            response = self.sg.send(message)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.body}")
            print(f"Response Headers: {response.headers}")
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Verification email sent successfully to {user.email}")
                return True
            else:
                logger.error(f"Failed to send verification email. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending verification email to {user.email}: {str(e)}")
            print(f"Error: {e}")
            return False
    
    def _get_verification_email_content(self, user: User, verification_code: str, verification_type: str) -> tuple:
        """
        Generate email content based on verification type
        
        Returns:
            tuple: (subject, html_content, text_content)
        """
        if verification_type == 'signup':
            subject = "Welcome to KairosAI - Verify Your Email"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Verification</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .verification-code {{ background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to KairosAI!</h1>
                        <p>Your AI-powered market intelligence platform</p>
                    </div>
                    <div class="content">
                        <h2>Hello {user.first_name}!</h2>
                        <p>Thank you for signing up for KairosAI. To complete your registration and start using our platform, please verify your email address.</p>
                        
                        <p>Your verification code is:</p>
                        <div class="verification-code">{verification_code}</div>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This code will expire in 15 minutes</li>
                            <li>Enter this code in the verification form to activate your account</li>
                            <li>If you didn't create an account with KairosAI, please ignore this email</li>
                        </ul>
                        
                        <p>Once verified, you'll have access to our powerful AI agents for market research, competitive analysis, and strategic insights.</p>
                    </div>
                    <div class="footer">
                        <p>This email was sent by KairosAI. If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
        elif verification_type == 'password_reset':
            subject = "KairosAI - Password Reset Verification"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Password Reset Verification</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .verification-code {{ background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user.first_name}!</h2>
                        <p>We received a request to reset your password for your KairosAI account.</p>
                        
                        <p>Your verification code is:</p>
                        <div class="verification-code">{verification_code}</div>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This code will expire in 15 minutes</li>
                            <li>Enter this code to proceed with password reset</li>
                            <li>If you didn't request a password reset, please ignore this email</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>This email was sent by KairosAI. If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
        else:  # email_change
            subject = "KairosAI - Email Change Verification"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Change Verification</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .verification-code {{ background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Change Verification</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user.first_name}!</h2>
                        <p>We received a request to change the email address for your KairosAI account.</p>
                        
                        <p>Your verification code is:</p>
                        <div class="verification-code">{verification_code}</div>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This code will expire in 15 minutes</li>
                            <li>Enter this code to confirm the email change</li>
                            <li>If you didn't request an email change, please ignore this email</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>This email was sent by KairosAI. If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        
        # Plain text version
        text_content = f"""
        Hello {user.first_name}!
        
        Your verification code is: {verification_code}
        
        This code will expire in 15 minutes.
        
        If you didn't request this verification, please ignore this email.
        
        Best regards,
        The KairosAI Team
        """
        
        return subject, html_content, text_content


# Global email service instance
email_service = EmailService()
