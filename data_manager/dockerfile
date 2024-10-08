FROM python:3.10-slim

COPY ./app /app
COPY ./requirements.txt /requirements.txt
WORKDIR /

RUN apt-get update
RUN pip3 install -r requirements.txt

CMD ["python3", "app/main.py"]