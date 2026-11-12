import math
import numpy as np
import pandas as pd

def make_json_safe(obj):
    """
    Recursively converts numpy types, pandas Timestamps, NaNs, and infinities
    into standard Python native types safe for JSON serialization and DB storage.
    """
    if obj is None:
        return None
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, (float, np.floating)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return 0.0
        return val
    if isinstance(obj, str):
        return obj
    if isinstance(obj, (np.bool_)):
        return bool(obj)
    if isinstance(obj, (pd.Timestamp, np.datetime64)):
        return str(obj)
    if isinstance(obj, np.ndarray):
        return make_json_safe(obj.tolist())
    if isinstance(obj, dict):
        return {str(k): make_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [make_json_safe(x) for x in obj]
    return str(obj)
