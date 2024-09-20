"""Given a array generated from tif file, crop the area of interest."""
import rasterio
from rasterio.mask import mask
import pyproj
from shapely import Polygon

def cropping(tif_src: rasterio.io.DatasetReader, AOI_points: list, AOI_coordinates_format: str = 'EPSG:4326'):

    # Changing the format of the polygon points
    if AOI_coordinates_format!='EPSG:32614':
        src_crs = pyproj.CRS(AOI_coordinates_format)
        tgt_crs = pyproj.CRS('EPSG:32614')
        transformer = pyproj.Transformer.from_crs(src_crs, tgt_crs, always_xy=True)
        AOI_coordinates_format = [transformer.transform(x, y) for x,y in AOI_coordinates_format]

    poly = Polygon(AOI_points)
    out_image, out_transform = mask(tif_src, [poly], crop=True)
    return out_image, out_transform