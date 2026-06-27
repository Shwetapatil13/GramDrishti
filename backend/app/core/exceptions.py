class GEETimeoutError(Exception):
    """Raised when an Earth Engine computation exceeds the timeout."""
    pass


class GEEDataError(Exception):
    """Raised when Earth Engine returns no data or invalid data."""
    pass


class VillageNotFoundError(Exception):
    """Raised when a requested village ID is not found in the system."""
    pass


class InvalidYearError(Exception):
    """Raised when the requested year is out of the supported bounds."""
    pass
