from typing import Dict, Any

# Professional EOS-style vegetation palette (ColorBrewer RdYlGn)
# Dark Red -> Red -> Orange -> Yellow -> Light Green -> Green -> Dark Green
EOS_PALETTE = [
    '#a50026',  # Dark Red (Water / Bare Soil)
    '#d73027',  # Red
    '#f46d43',  # Orange-Red
    '#fdae61',  # Orange
    '#fee08b',  # Yellow-Orange
    '#ffffbf',  # Yellow (Sparse Vegetation)
    '#d9ef8b',  # Light Green-Yellow
    '#a6d96a',  # Light Green
    '#66bd63',  # Medium Green
    '#1a9850',  # Green
    '#006837'   # Dark Green (Dense Forest)
]

CVI_PALETTE = [
    '#ef4444', '#f59e0b', '#22c55e'
]

RADAR_MOISTURE_PALETTE = [
    '#b30000', '#e34a33', '#fc8d59', '#fdcc8a',
    '#ffffbf', '#c2e699', '#78c679', '#31a354', '#006837',
]

RADAR_SEQUENTIAL_PALETTE = [
    '#f7fbff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c',
]

WATER_PALETTE = [
    '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'
]

LAYER_REGISTRY: Dict[str, Dict[str, Any]] = {
    "NDVI": {
        "id": "NDVI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Normalized Difference Vegetation Index",
        "description": "Measures healthy green vegetation.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -0.1,
            "max": 0.9,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "EVI": {
        "id": "EVI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Enhanced Vegetation Index",
        "description": "Corrects for atmospheric effects and canopy background noise.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -0.1,
            "max": 0.9,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "SAVI": {
        "id": "SAVI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Soil-Adjusted Vegetation Index",
        "description": "Minimizes soil brightness influences in sparse vegetation.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -0.1,
            "max": 0.9,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "NDMI": {
        "id": "NDMI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Normalized Difference Moisture Index",
        "description": "Moisture intelligence.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -0.2,
            "max": 0.8,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "GNDVI": {
        "id": "GNDVI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Green Normalized Difference Vegetation Index",
        "description": "Chlorophyll signal.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -0.1,
            "max": 0.9,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "NDWI": {
        "id": "NDWI",
        "provider": "Sentinel2Provider",
        "category": "Water",
        "name": "Normalized Difference Water Index",
        "description": "Water body detection.",
        "visualization": {
            "palette": EOS_PALETTE,
            "min": -1.0,
            "max": 1.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "CVI": {
        "id": "CVI",
        "provider": "Sentinel2Provider",
        "category": "Optical",
        "name": "Composite Vegetation Index",
        "description": "Weighted fusion of multiple indices.",
        "visualization": {
            "palette": CVI_PALETTE,
            "min": 0.0,
            "max": 1.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "SMI": {
        "id": "SMI",
        "provider": "Sentinel1Provider",
        "category": "Radar",
        "name": "Soil Moisture Index",
        "description": "Estimates soil moisture from SAR VV backscatter.",
        "visualization": {
            "palette": RADAR_MOISTURE_PALETTE,
            "min": 0.0,
            "max": 1.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "RVI": {
        "id": "RVI",
        "provider": "Sentinel1Provider",
        "category": "Radar",
        "name": "Radar Vegetation Index",
        "description": "Vegetation structure from VV/VH ratio.",
        "visualization": {
            "palette": RADAR_SEQUENTIAL_PALETTE,
            "min": 0.0,
            "max": 1.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "RATIO": {
        "id": "RATIO",
        "provider": "Sentinel1Provider",
        "category": "Radar",
        "name": "VV/VH Ratio",
        "description": "Ratio of VV to VH backscatter.",
        "visualization": {
            "palette": RADAR_SEQUENTIAL_PALETTE,
            "min": 2.0,
            "max": 16.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "VV": {
        "id": "VV",
        "provider": "Sentinel1Provider",
        "category": "Radar",
        "name": "VV Backscatter",
        "description": "Vertical transmission and vertical reception.",
        "visualization": {
            "palette": RADAR_MOISTURE_PALETTE,
            "min": -22.0,
            "max": -6.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "VH": {
        "id": "VH",
        "provider": "Sentinel1Provider",
        "category": "Radar",
        "name": "VH Backscatter",
        "description": "Vertical transmission and horizontal reception.",
        "visualization": {
            "palette": RADAR_MOISTURE_PALETTE,
            "min": -28.0,
            "max": -12.0,
            "opacity": 0.9,
            "smoothing": True
        }
    },
    "WATER": {
        "id": "WATER",
        "provider": "WaterProvider",
        "category": "Water",
        "name": "Surface Water Occurrence",
        "description": "Probability of surface water presence.",
        "visualization": {
            "palette": WATER_PALETTE,
            "min": 0.0,
            "max": 100.0,
            "opacity": 0.8,
            "smoothing": False
        }
    }
}
