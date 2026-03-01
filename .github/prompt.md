# Icarus

## Ripped Assets

Location: `E:\_assets_ripped\Icarus_Ripped\versions\221.2\Content`
Data: `E:\_assets_ripped\Icarus_Ripped\versions\221.2\Content\Data`
Media: `E:\_assets_ripped\Icarus_Ripped\versions\221.2\Content\Assets\2DArt\UI`

## Website Features

- Interactive Crafting Recipe with search and filter options
  - Utilizing game media assets
  - A way to expand "raw materials" requirement for crafting
  - A way to display a "workflow" flowchart on how to craft an item
  - Page loading should be seamless for the user, with no noticeable lag or delay
  - All recipes should use the media assets for the raw materials
- Cheatsheet for getting beyond Tier 1. (Tier 2, Tier 3, Tier 4)
  - This should be a single page with a navigation menu.
  - It should include all the necessary information like raw materials, crafting stations, and any other relevant details.
  - The page should be easy to navigate and visually appealing, utilizing the media assets for better user experience.
- Cheatsheet should be designed for more sections to easily added later.

## Implementation Details

- Choice - which do you think is best?
  - Extract and stage all information using Python in Icarus_Ripped folder. Using the latest data grab (versions/<latest_version>/Content/Data).
  - Perform all extraction and staging in the monorepo
