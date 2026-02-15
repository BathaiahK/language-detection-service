# API Usage Examples

## Using cURL

### Detect languages in a project

```bash
curl -X POST http://localhost:3001/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/path/to/your/project",
    "analyzeDependencies": true,
    "detectFrameworks": true
  }'
```

### Get supported languages

```bash
curl http://localhost:3001/api/v1/languages
```

### Health check

```bash
curl http://localhost:3001/health
```

## Using Node.js/JavaScript

```javascript
const axios = require('axios');

async function detectLanguages() {
  try {
    const response = await axios.post('http://localhost:3001/api/v1/detect', {
      projectPath: '/path/to/your/project',
      analyzeDependencies: true,
      detectFrameworks: true,
      maxFiles: 10000
    });

    console.log('Primary Language:', response.data.primaryLanguage);
    console.log('All Languages:', response.data.languages);
    console.log('Total Files:', response.data.totalFiles);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

detectLanguages();
```

## Using Python

```python
import requests

def detect_languages():
    url = 'http://localhost:3001/api/v1/detect'
    payload = {
        'projectPath': '/path/to/your/project',
        'analyzeDependencies': True,
        'detectFrameworks': True
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print('Primary Language:', data['primaryLanguage'])
        print('All Languages:', data['languages'])
        print('Total Files:', data['totalFiles'])
    except requests.exceptions.RequestException as e:
        print('Error:', e)

detect_languages()
```

## Batch Detection

```bash
curl -X POST http://localhost:3001/api/v1/detect/batch \
  -H "Content-Type: application/json" \
  -d '{
    "projects": [
      {
        "projectPath": "/path/to/project1",
        "detectFrameworks": true
      },
      {
        "projectPath": "/path/to/project2",
        "detectFrameworks": false
      }
    ]
  }'
```

## Response Example

```json
{
  "requestId": "123e4567-e89b-12d3-a456-426614174000",
  "projectPath": "/path/to/project",
  "languages": [
    {
      "language": "javascript",
      "confidence": 0.95,
      "percentage": 75.5,
      "fileCount": 150,
      "files": ["src/index.js", "src/app.js", "..."],
      "packageManager": "npm",
      "framework": "React"
    },
    {
      "language": "typescript",
      "confidence": 0.85,
      "percentage": 20.0,
      "fileCount": 40,
      "files": ["src/types.ts", "..."],
      "packageManager": "npm"
    }
  ],
  "primaryLanguage": {
    "language": "javascript",
    "confidence": 0.95,
    "percentage": 75.5,
    "fileCount": 150,
    "packageManager": "npm",
    "framework": "React"
  },
  "totalFiles": 200,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 1250,
  "metadata": {
    "hasGitRepository": true,
    "hasDependencies": true,
    "hasTests": true,
    "hasDocumentation": true
  }
}
```

## Error Handling

```javascript
try {
  const response = await axios.post('http://localhost:3001/api/v1/detect', {
    projectPath: '/invalid/path'
  });
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Status:', error.response.status);
    console.error('Error:', error.response.data);
    // {
    //   "code": "ENOENT",
    //   "message": "Project path does not exist",
    //   "timestamp": "2024-01-15T10:30:00.000Z"
    // }
  }
}
```

## Rate Limiting

The API is rate-limited to 100 requests per 15 minutes per IP address. If you exceed this limit, you'll receive:

```json
{
  "error": "TOO_MANY_REQUESTS",
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```
