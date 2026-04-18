import pandas as pd
from typing import BinaryIO
import io

def parse_excel(stream: BinaryIO) -> str:
    """
    Parses an Excel or CSV file stream and converts it into a structured
    string format that AI can easily interpret.
    """
    try:
        try:
            df = pd.read_excel(stream)
        except Exception:
            stream.seek(0)
            df = pd.read_csv(stream)
        
        df = df.dropna(how='all')
        
        content = "Spreadsheet Assessment Data:\n"
        content += df.to_string(index=False)
        
        return content
    except Exception as e:
        print(f"Spreadsheet Parsing Error: {e}")
        return ""
