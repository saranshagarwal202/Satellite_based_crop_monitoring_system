#function to check clouds 
import numpy as np

def check_for_clouds(cropped_image, threshold=250, ratio=0.1): #percentage need to be changed based on criterion
    """
    args:
        cropped_image: numpy.ndarray image array
        threshold: int the value of pixel that makes it white, example 250 means that all rgb values should be greater than 250 to make it a white pixel
        ratio: ratio of white pixels allowed in image.
    """
    assert cropped_image.shape[0] == 4 
    cropped_image = cropped_image[:3, :, :]
    # Calculate the total number of pixels
    total_pixels = cropped_image.shape[1]*cropped_image.shape[2]
    
    # Count pixels equal to the threshold
    cloud_pixels = np.all(cropped_image >= threshold, axis=0).sum()
    
    # Calculate the ratio of cloud pixels
    cloud_percentage = cloud_pixels / total_pixels
    
    # Return True if the ratio of cloud pixels is greater than or equal to the specified ratio
    return cloud_percentage >= ratio, ratio

    
#############
# Example usage:
#out_image, out_transform = cropping(tif_src, AOI_points, AOI_coordinates_format)
#clouds_present = check_for_clouds(out_image)
#print(f"Clouds detected: {clouds_present}")
#############
