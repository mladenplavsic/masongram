# MasonGram

jQuery plugin to add Instagram feed to a page.

## Features

- Simple
- Responsive
- Infinite loading while scrolling down
- Link to a location on map (configurable either via caption text `@12.34,56.78` or via image location tag)
- Configurable image caption with "caption", "location", "likes"

## Usage

    $('#masongram').masongram();

### Options

| Option | Type | Configuration for | Description | Default  |
|---|---|---|---|---|
| `access_token` | `string` | Instagram API | Authorization (required) |  |
| `endpoint` | `string` | Instagram API | Endpoint of Instagram API media source | `users/self` |
| `count` | `number` | Instagram API | Number of results for one API request | `10` |
| `size` | `string` | Instagram API | Instagram image resolution: `low_resolution`, `standard_resolution` | `low_resolution` |
| `offset` | `number` | MasonGram | Distance (percent) from bottom of page where new API request is sent | `10` |
| `caption` | `string` | MasonGram | HTML content of caption, with variables: `{caption}`, `{location}`, `{likes}` | {caption} |

### Events

| Event | Description |
|---|---|
|`masongram:error`| Triggered when error detected |
|`masongram:api:end`| Triggered when reached end of API resources |

## Dependencies

- jQuery
- Masonry (jQuery plugin)
- ImagesLoaded (jQuery plugin)

