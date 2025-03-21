FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port that the app runs on
EXPOSE 8001

# Command to run the application
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8001"]