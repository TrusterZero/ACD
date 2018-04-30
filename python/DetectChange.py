import numpy as np 
import rasterio
import uuid
import highlightChanges
import matplotlib.pyplot as plt

detection_method_index = "0" #detection method identifier
error_margin = 30 #color changes less then this number shouldn't be detected as a change

def get_difference(user_id, original_img_path, new_img_path):

    #create unique filename for storing image
    filename = str(user_id) + detection_method_index + str(uuid.uuid1())
    filepath = "../images/" + filename +".jpg"

    #load images
    original_img = rasterio.open(original_img_path)
    new_img = rasterio.open(new_img_path)

    #convert images to np_arrays
    original_img_array = original_img.read().astype(np.float)
    new_img_array = new_img.read().astype(np.float)

    #substract arrays to get difference
    difference = np.subtract(original_img_array,new_img_array)
    detected_changes = difference
    
    #scan for changes smaller then the error margin
    invalid_changes = np.where((difference > -error_margin) & (difference < error_margin))
    detected_changes[not invalid_changes] = 255 
    detected_changes[invalid_changes] = 0
   
    with rasterio.open(filepath,
                        "w",
                        driver="JPEG",
                        height = original_img.shape[0],
                        width = original_img.shape[1],
                        count= 4,
                        dtype= np.uint16) as dst:
        dst.write(detected_changes.astype(np.uint16)) 
    
    highlightChanges.highlight(original_img_path,filename+".jpg")

get_difference(0,"../images/1048676_3163220_2018-01-07_1004_RGB_Visual_clip.tif","../images/1054455_3163220_2018-01-09_1009_RGB_Visual_clip.tif")