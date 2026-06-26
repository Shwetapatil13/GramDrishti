"""
Dynamic World (GOOGLE/DYNAMICWORLD/V1) land cover retrieval.
Returns area percentage for each of 9 land cover classes.
"""
import ee
from app.services.gee.geometry import geojson_to_ee_geometry
from app.core.exceptions import GEEDataError

def get_land_cover(boundary: dict, year: int) -> dict[str, float]:
    """
    Classes: water, trees, grass, flooded_vegetation, crops,
             shrub_and_scrub, built, bare, snow_and_ice
    Returns area percentage for each class (should sum to ~100%).
    """
    try:
        geom = geojson_to_ee_geometry(boundary)
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        # Dynamic World collection
        dw = (ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
              .filterBounds(geom)
              .filterDate(start_date, end_date))

        if dw.size().getInfo() == 0:
            raise GEEDataError(f"No Dynamic World imagery found for {year}")

        # Use the mode (most frequent class) over the year
        classification = dw.select('label').mode().clip(geom)

        # Calculate area (in square meters) per class using pixel area
        area_image = ee.Image.pixelArea().addBands(classification)
        
        # We use grouped reducer to sum area by class label
        stats = area_image.reduceRegion(
            reducer=ee.Reducer.sum().group(
                groupField=1,
                groupName='label'
            ),
            geometry=geom,
            scale=10,
            maxPixels=1e9
        ).getInfo()

        # Dynamic World classes mapping
        dw_classes = {
            0: "water",
            1: "trees",
            2: "grass",
            3: "flooded_vegetation",
            4: "crops",
            5: "shrub_and_scrub",
            6: "built",
            7: "bare",
            8: "snow_and_ice"
        }

        # Initialize results with 0
        results = {name: 0.0 for name in dw_classes.values()}

        groups = stats.get('groups', [])
        
        # Calculate total area to get percentages
        total_area = sum([g.get('sum', 0) for g in groups])
        
        if total_area > 0:
            for group in groups:
                label_val = group.get('label')
                area_val = group.get('sum', 0)
                if label_val in dw_classes:
                    class_name = dw_classes[label_val]
                    # Convert to percentage
                    results[class_name] = (area_val / total_area) * 100.0

        return results

    except ee.EEException as e:
        raise GEEDataError(f"Earth Engine error processing Dynamic World: {str(e)}")
    except Exception as e:
        raise GEEDataError(f"Error processing Dynamic World metrics: {str(e)}")