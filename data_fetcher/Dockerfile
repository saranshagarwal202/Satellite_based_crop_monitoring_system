FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    build-essential

ENV GDAL_VERSION=3.6.0
ENV GDAL_INCLUDE_DIR=/usr/include/gdal
ENV GDAL_LIB_DIR=/usr/lib/x86_64-linux-gnu

COPY ./requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt

COPY ./app /app

WORKDIR /app

CMD ["python3", "main.py"]
