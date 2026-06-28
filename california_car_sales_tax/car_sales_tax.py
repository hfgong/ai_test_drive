import requests
import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt

# Download the GeoJSON file
geojson_response = requests.get('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/california-counties.geojson')
california_counties = geojson_response.json()

# Load the GeoJSON data into a GeoDataFrame
gdf = gpd.GeoDataFrame.from_features(california_counties['features'])

# Load the sales tax data from the uploaded file
sales_tax_df = pd.read_csv('/content/car-sales-tax-ca.csv')

# Preprocess the data
sales_tax_df['Rate'] = sales_tax_df['Rate'].str.rstrip('%').astype('float') / 100
county_sales_tax = sales_tax_df.groupby('County')['Rate'].mean().reset_index()

# Merge the sales tax data with the GeoDataFrame
gdf = gdf.merge(county_sales_tax, left_on='name', right_on='County', how='left')

# Define the bounds for Northern California (approximate)
northern_california_bounds = {
    'minx': -124,
    'miny': 36,
    'maxx': -119,
    'maxy': 42
}

# Plotting the map focused on Northern California
fig, ax = plt.subplots(1, 1, figsize=(15, 10))
gdf.plot(column='Rate', ax=ax, legend=True, cmap='OrRd', edgecolor='black')
ax.set_xlim(northern_california_bounds['minx'], northern_california_bounds['maxx'])
ax.set_ylim(northern_california_bounds['miny'], northern_california_bounds['maxy'])

# Annotate each county with its name and tax rate
for idx, row in gdf.iterrows():
    if row['geometry'].centroid.x >= northern_california_bounds['minx'] and \
       row['geometry'].centroid.x <= northern_california_bounds['maxx'] and \
       row['geometry'].centroid.y >= northern_california_bounds['miny'] and \
       row['geometry'].centroid.y <= northern_california_bounds['maxy']:
        plt.annotate(text=f"{row['name']}\n{row['Rate']:.2%}", xy=(row['geometry'].centroid.x, row['geometry'].centroid.y),
                     horizontalalignment='center', fontsize=8)

plt.title('Average Car Sales Tax Rates in Northern California Counties')
plt.show()
