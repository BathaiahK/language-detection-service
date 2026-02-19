from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'service': 'test-django-app'
    })


@api_view(['GET', 'POST'])
def example_view(request):
    """Example API view"""
    if request.method == 'POST':
        data = request.data
        return Response({
            'message': 'Data received',
            'data': data
        })

    return Response({
        'message': 'Hello from Django!'
    })
