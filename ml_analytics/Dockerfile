FROM osgeo/gdal:ubuntu-full-3.6.3
RUN apt-get update  && apt-get install -y python3-pip libcairo2-dev cmake build-essential
# && apt-get install -y \
#     gdal-bin \
#     libgdal-dev \
#     build-essential

# ENV GDAL_VERSION=3.6.0
# ENV GDAL_INCLUDE_DIR=/usr/include/gdal
# ENV GDAL_LIB_DIR=/usr/lib/x86_64-linux-gnu
RUN pip3 install --force-reinstall meson ninja
COPY ./requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt

COPY ./app /app
WORKDIR /app

# CMD ["python3", "main.py"]
