from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
import uuid
import random
import string


class UserManager(BaseUserManager):
    """Custom UserManager for email-only authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    username = None  # Remove username field
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Google OAuth fields
    google_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    provider = models.CharField(max_length=50, blank=True, null=True)  # 'google', 'email', etc.
    profile_picture = models.URLField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email


class EmailVerification(models.Model):
    """Model to store email verification codes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    code = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    verification_type = models.CharField(
        max_length=20,
        choices=[
            ('signup', 'Sign Up'),
            ('password_reset', 'Password Reset'),
            ('email_change', 'Email Change'),
        ],
        default='signup'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['user', 'is_used']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_verification_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)  # 15 minutes expiry
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_verification_code():
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        """Check if the verification code has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the verification code is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired()
    
    def mark_as_used(self):
        """Mark the verification code as used"""
        self.is_used = True
        self.save(update_fields=['is_used'])
    
    def __str__(self):
        return f"Verification for {self.user.email} - {self.code}"
