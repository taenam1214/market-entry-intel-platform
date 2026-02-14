from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.utils import timezone
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, GoogleAuthSerializer, EmailVerificationSerializer, VerifyCodeSerializer
from .models import User, EmailVerification
from .email_service import email_service
from .permissions import IsAdmin


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create token for the user (for future use after verification)
        token, created = Token.objects.get_or_create(user=user)
        
        # Create verification code and send email
        verification = EmailVerification.objects.create(
            user=user,
            verification_type='signup'
        )
        
        # Send verification email
        email_sent = email_service.send_verification_email(
            user, verification.code, 'signup'
        )
        
        if email_sent:
            return Response({
                'message': 'User created successfully. Please check your email for verification code.',
                'user': UserSerializer(user).data,
                'email_verification_required': True
            }, status=status.HTTP_201_CREATED)
        else:
            # If email fails, still create user but mark as unverified
            return Response({
                'message': 'User created successfully, but verification email failed to send. Please try resending verification.',
                'user': UserSerializer(user).data,
                'email_verification_required': True,
                'email_send_failed': True
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


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_email(request):
    """Send email verification code"""
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        verification_type = serializer.validated_data['verification_type']
        
        try:
            # Get or create user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user is already verified for signup
            if verification_type == 'signup' and user.is_verified:
                return Response({
                    'error': 'Email is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Invalidate any existing unused verification codes for this user and type
            EmailVerification.objects.filter(
                user=user, 
                verification_type=verification_type, 
                is_used=False
            ).update(is_used=True)
            
            # Create new verification code
            verification = EmailVerification.objects.create(
                user=user,
                verification_type=verification_type
            )
            
            # Send email
            success = email_service.send_verification_email(
                user, verification.code, verification_type
            )
            
            if success:
                return Response({
                    'message': 'Verification email sent successfully',
                    'email': email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to send verification email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': 'Failed to send verification email',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_code(request):
    """Verify email verification code"""
    serializer = VerifyCodeSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        verification_type = serializer.validated_data['verification_type']
        
        try:
            user = User.objects.get(email=email)
            
            # Find valid verification code
            verification = EmailVerification.objects.filter(
                user=user,
                code=code,
                verification_type=verification_type,
                is_used=False
            ).first()
            
            if not verification:
                return Response({
                    'error': 'Invalid verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if verification.is_expired():
                return Response({
                    'error': 'Verification code has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark code as used
            verification.mark_as_used()
            
            # Handle verification based on type
            if verification_type == 'signup':
                user.is_verified = True
                user.save()
                
                # Auto-login user after verification by creating/getting token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'message': 'Email verified successfully. You are now logged in.',
                    'user': UserSerializer(user).data,
                    'token': token.key  # Return token for auto-login
                }, status=status.HTTP_200_OK)
            
            elif verification_type == 'password_reset':
                # For password reset, we just verify the code is valid
                # The actual password reset would be handled in a separate endpoint
                return Response({
                    'message': 'Email verified for password reset',
                    'verified': True
                }, status=status.HTTP_200_OK)
            
            elif verification_type == 'email_change':
                # For email change, we just verify the code is valid
                return Response({
                    'message': 'Email verified for email change',
                    'verified': True
                }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Verification failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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


# --------------- Admin Views ---------------

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from apps.analysis.models import MarketReport

        total_users = User.objects.count()
        total_reports = MarketReport.objects.count()
        reports_by_status = dict(
            MarketReport.objects.values_list('status').annotate(count=Count('id')).order_by('status')
        )
        users_by_tier = dict(
            User.objects.values_list('subscription_tier').annotate(count=Count('id')).order_by('subscription_tier')
        )
        recent_signups = UserSerializer(
            User.objects.order_by('-created_at')[:10], many=True
        ).data

        return Response({
            'total_users': total_users,
            'total_reports': total_reports,
            'reports_by_status': reports_by_status,
            'users_by_tier': users_by_tier,
            'recent_signups': recent_signups,
        })


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from apps.analysis.models import MarketReport

        users = User.objects.annotate(report_count=Count('market_reports')).order_by('-created_at')

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        user_list = []
        for u in users[start:end]:
            data = UserSerializer(u).data
            data['report_count'] = u.report_count
            data['last_login'] = u.last_login.isoformat() if u.last_login else None
            data['is_active'] = u.is_active
            user_list.append(data)

        return Response({
            'users': user_list,
            'total': users.count(),
            'page': page,
            'page_size': page_size,
        })

    def patch(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed_fields = ['role', 'subscription_tier', 'is_active']
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        return Response({'message': 'User updated', 'user': UserSerializer(user).data})


class AdminReportsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from apps.analysis.models import MarketReport

        reports = MarketReport.objects.select_related('user').order_by('-created_at')

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        report_list = []
        for r in reports[start:end]:
            report_list.append({
                'id': r.id,
                'analysis_id': r.analysis_id,
                'user_email': r.user.email,
                'company_name': r.company_name,
                'target_market': r.target_market,
                'industry': r.industry,
                'status': r.status,
                'created_at': r.created_at.isoformat(),
            })

        return Response({
            'reports': report_list,
            'total': reports.count(),
            'page': page,
            'page_size': page_size,
        })
