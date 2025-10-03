from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_verified', 'created_at', 'provider', 'profile_picture')
        read_only_fields = ('id', 'is_verified', 'created_at', 'provider', 'profile_picture')


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth authentication"""
    access_token = serializers.CharField()
    
    def validate_access_token(self, value):
        """Validate Google access token and extract user info"""
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(value, requests.Request())
            
            # Check if the token is from Google
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise serializers.ValidationError('Invalid token issuer')
            
            return idinfo
        except ValueError as e:
            raise serializers.ValidationError('Invalid Google access token')
