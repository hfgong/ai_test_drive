# California County Car Sales Tax Visualization

This Python script visualizes the average car sales tax rates for counties in Northern California using a choropleth map. It utilizes the `requests`, `geopandas`, `pandas`, and `matplotlib` libraries to download and process the necessary data, and create an informative map.

## Prerequisites

To run this script, you need to have the following dependencies installed:

- Python 3.x
- requests
- geopandas
- pandas
- matplotlib

You can install these dependencies using pip:

```
pip install requests geopandas pandas matplotlib
```

## Data Sources

The script uses two data sources:

1. California Counties GeoJSON: This file contains the geographical boundaries of California counties and is downloaded from the GitHub repository of Code for America's "Click That Hood" project.
   - URL: https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/california-counties.geojson

2. Car Sales Tax Data: This CSV file contains the car sales tax rates for each county in California. It should be uploaded to the same directory as the script and named 'car-sales-tax-ca.csv'.

## Usage

1. Ensure that you have the required dependencies installed.
2. Download or clone the script to your local machine.
3. Upload the 'car-sales-tax-ca.csv' file to the same directory as the script.
4. Run the script using Python:
   ```
   python car_sales_tax.py
   ```
5. The script will download the California Counties GeoJSON file, process the data, and display a choropleth map of Northern California counties with their average car sales tax rates.

## Prompts

I used the following prompts to generate the code:

* In California, each county or city might have different car sale taxes.  Could you help me create a car sale tax map, either using Javascript or Python?  You can download the city or county level car sales tax table from internet, and also find some geo json data for California from github or somewhere else.
* I find the per city tax table is too big for you to download, so I downloaded it by myself, and send it to you now.  Could you write Python code to download the GeoJson data, and create the sale tax map based on this CSV file?
* Could you help me add County name and tax number to the map?
* How to make the output figure focus on the north california part?

## Acknowledgments

- The California Counties GeoJSON data is provided by [Code for America's "Click That Hood" project](https://github.com/codeforamerica/click_that_hood).
- The California per city car sales data is downloaded from [California Department of Tax and Fee Administration](https://www.cdtfa.ca.gov/taxes-and-fees/rates.aspx)
