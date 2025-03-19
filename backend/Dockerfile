# Use the official Python image
FROM python:3.9

# Create a non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Set the working directory
WORKDIR /app

# Copy dependencies file first
COPY requirements.txt .

# ✅ Install dependencies as root before switching user
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Change ownership of the directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the backend port
EXPOSE 8000

# Run the Flask app with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "wsgi:app"]
