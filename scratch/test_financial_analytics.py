import sys
import os
sys.path.append('.')

from backend.app import create_app
from backend.routes.admin import get_financial_analytics

app = create_app()
with app.app_context():
    try:
        with app.test_request_context('/api/admin/financial-analytics?filter=this-month'):
            response, status_code = get_financial_analytics()
            print("Status Code:", status_code)
            print("Response:", response.get_json() if hasattr(response, 'get_json') else response)
    except Exception as e:
        import traceback
        traceback.print_exc()
