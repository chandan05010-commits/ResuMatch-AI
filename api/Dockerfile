FROM python:3.12-slim

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Copy requirements and install
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Add user bin to PATH
ENV PATH="/home/appuser/.local/bin:${PATH}"

# Copy application code
COPY --chown=appuser:appuser . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]