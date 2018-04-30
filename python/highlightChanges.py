import numpy as np
import rasterio


def highlight(original_img_filepath, changes_filename):

    #load images
    original_img = rasterio.open(original_img_filepath)
    changes_img = rasterio.open("../images/"+changes_filename)

    #convert images to np_arrays
    original_img_array = original_img.read().astype(np.float)
    changes_array = changes_img.read().astype(np.float)

    print(changes_array)

    #Check for changes on all colorbands
    #highlight those changes on the green colorband

    for band in range(len(original_img_array)):
        original_img_array[1][np.where(changes_array[band] != 0)] = 255


    with rasterio.open("../images/"+changes_filename+"-hgl.jpg",
                    "w",
                    driver="JPEG",
                    height = original_img.shape[0],
                    width = original_img.shape[1],
                    count= len(original_img_array),
                    dtype= np.uint8) as dst:
        dst.write(original_img_array.astype(np.uint8)) 