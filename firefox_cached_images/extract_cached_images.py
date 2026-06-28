import os
import shutil
from pathlib import Path
import mmap

def is_image_file(file_path):
    try:
        with open(file_path, 'rb') as f:
            header = f.read(8)
            return (header.startswith(b'\xFF\xD8\xFF') or  # JPEG
                    header.startswith(b'\x89PNG\r\n\x1a\n') or  # PNG
                    header.startswith(b'GIF87a') or  # GIF
                    header.startswith(b'GIF89a'))  # GIF
    except Exception:
        return False

def extract_firefox_cache_images(min_size_kb=30):
    # Firefox cache directory on Mac
    cache_dir = Path.home() / "Library/Caches/Firefox"
    
    print(f"Searching for Firefox cache in: {cache_dir}")
    
    if not cache_dir.exists():
        print(f"Firefox cache directory not found: {cache_dir}")
        return
    
    # Create output directory
    output_dir = Path("firefox_cache_images")
    output_dir.mkdir(exist_ok=True)
    print(f"Output directory: {output_dir}")
    
    # Counter for processed and saved files
    processed_files = 0
    saved_files = 0
    
    # Recursively search for files
    for file_path in cache_dir.rglob('*'):
        if file_path.is_file():
            processed_files += 1
            if file_path.stat().st_size > min_size_kb * 1024:
                if is_image_file(file_path):
                    try:
                        # Determine file extension
                        with open(file_path, 'rb') as f:
                            header = f.read(8)
                            if header.startswith(b'\xFF\xD8\xFF'):
                                ext = '.jpg'
                            elif header.startswith(b'\x89PNG\r\n\x1a\n'):
                                ext = '.png'
                            elif header.startswith(b'GIF8'):
                                ext = '.gif'
                            else:
                                ext = '.bin'
                        
                        # Create a unique filename
                        output_file = output_dir / f"{file_path.stem}{ext}"
                        counter = 1
                        while output_file.exists():
                            output_file = output_dir / f"{file_path.stem}_{counter}{ext}"
                            counter += 1
                        
                        # Copy the file
                        shutil.copy2(file_path, output_file)
                        print(f"Saved: {output_file}")
                        saved_files += 1
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")
            
            if processed_files % 1000 == 0:
                print(f"Processed {processed_files} files, saved {saved_files} images so far...")
    
    print(f"Processed {processed_files} files, saved {saved_files} images.")
    print("Extraction complete.")

if __name__ == "__main__":
    extract_firefox_cache_images()
