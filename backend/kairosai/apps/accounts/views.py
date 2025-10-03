from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, GoogleAuthSerializer
from .models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        # Delete the user's token
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile with enhanced validation"""
    user = request.user
    data = request.data.copy()
    
    # Check if email is being changed
    new_email = data.get('email')
    if new_email and new_email != user.email:
        # Check if email already exists
        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response({
                'error': 'Email already exists',
                'details': 'This email address is already registered to another account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # For email changes, we might want to require verification
        # For now, we'll allow the change but mark as unverified
        data['is_verified'] = False
    
    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Google OAuth authentication endpoint"""
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        try:
            idinfo = serializer.validated_data['access_token']
            
            # Extract user information from Google token
            google_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            profile_picture = idinfo.get('picture', '')
            
            # Check if user exists by Google ID
            try:
                user = User.objects.get(google_id=google_id)
            except User.DoesNotExist:
                # Check if user exists by email
                try:
                    user = User.objects.get(email=email)
                    # Update existing user with Google ID
                    user.google_id = google_id
                    user.provider = 'google'
                    user.profile_picture = profile_picture
                    user.save()
                except User.DoesNotExist:
                    # Create new user
                    user = User.objects.create_user(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        google_id=google_id,
                        provider='google',
                        profile_picture=profile_picture,
                        is_verified=True  # Google users are pre-verified
                    )
            
            # Login the user
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'message': 'Google authentication successful',
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Google authentication failed',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    new_password_confirm = request.data.get('new_password_confirm')
    
    if not all([old_password, new_password, new_password_confirm]):
        return Response({
            'error': 'All password fields are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != new_password_confirm:
        return Response({
            'error': 'New passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if old password is correct
    if not request.user.check_password(old_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate new password
    try:
        validate_password(new_password, user=request.user)
    except ValidationError as e:
        return Response({
            'error': 'Password validation failed',
            'details': list(e.messages)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({
        'message': 'Password changed successfully'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    """Change user email with additional validation"""
    new_email = request.data.get('new_email')
    current_password = request.data.get('current_password')
    
    if not new_email or not current_password:
        return Response({
            'error': 'New email and current password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify current password
    if not request.user.check_password(current_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
        return Response({
            'error': 'Email already exists',
            'details': 'This email address is already registered to another account'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update email and mark as unverified
    request.user.email = new_email
    request.user.is_verified = False
    request.user.save()
    
    return Response({
        'message': 'Email changed successfully. Please verify your new email address.',
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)
