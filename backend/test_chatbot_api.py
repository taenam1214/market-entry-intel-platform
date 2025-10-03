#!/usr/bin/env python3
"""
Test script for chatbot API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health/")
        print(f"Health Check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_market_reports():
    """Test market reports endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/reports/")
        print(f"Market Reports: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data.get('count', 0)} reports")
        return response.status_code == 200
    except Exception as e:
        print(f"Market reports test failed: {e}")
        return False

def test_chat_conversations():
    """Test chat conversations endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/chat/conversations/")
        print(f"Chat Conversations: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data.get('count', 0)} conversations")
        return response.status_code == 200
    except Exception as e:
        print(f"Chat conversations test failed: {e}")
        return False

def test_send_message():
    """Test sending a chat message"""
    try:
        data = {
            "content": "What are the key insights from my market analysis reports?"
        }
        response = requests.post(
            f"{BASE_URL}/chat/messages/",
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Send Message: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Conversation ID: {result.get('conversation_id')}")
            print(f"AI Response: {result.get('ai_message', {}).get('content', '')[:100]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"Send message test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Chatbot API Endpoints")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health_check),
        ("Market Reports", test_market_reports),
        ("Chat Conversations", test_chat_conversations),
        ("Send Message", test_send_message),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 40)
    print("Test Results:")
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nOverall: {passed}/{total} tests passed")
