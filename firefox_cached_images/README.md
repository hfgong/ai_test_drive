# Firefox Cache Image Extractor

This Python script extracts images from the Firefox cache on macOS systems. It searches through the Firefox cache directory, identifies image files, and saves them to a specified output directory. The code is generates using Claude 3.5 Sonnet.

## Prompts
* Help me write Python script to extract images from Firefox cache on Mac, and save all images bigger than 30K as separate file.
* You assumed the file is stored as Sqlite database. I can find the following file, but it is not a sqlite database ~/Users/${USER}~/Library/Caches/Firefox/Profiles/8gawi48c.default/cache2/index


## Features

- Recursively searches the Firefox cache directory
- Extracts JPEG, PNG, and GIF images
- Saves images larger than a specified size (default 30KB)

## Requirements

- Python 3.6 or higher
- macOS operating system
- Firefox browser installed

## Usage

Run the script from the command line:
```bash
python extract_firefox_cache.py
```
