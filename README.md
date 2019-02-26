# MasonGram

jQuery plugin to add Instagram feed to a page.

## Demo

https://mladenplavsic.github.io/masongram/

## Features

- Simple
- Responsive
- Infinite loading while scrolling down
- Link to a location on map (configurable either via caption text `@12.34,56.78` or via image location tag)
- Configurable image caption with "caption", "location", "likes"

## Usage

    $('#masongram').masongram();

### Options

##### access_token

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `string` | Instagram API | Authorization (required) |  |

##### endpoint

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `string` | Instagram API | Endpoint of Instagram API media source | `users/self` |

#### count

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `number` | Instagram API | Number of results for one API request | `10` |

##### size

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `string` | Instagram API | Instagram image resolution: `low_resolution`, `standard_resolution` | `low_resolution` |

##### offset

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `number` | MasonGram | Distance (percent) from bottom of page where new API request is sent | `10` |

##### caption

| Type | Configuration for | Description | Default  |
|---|---|---|---|
| `string` | MasonGram | HTML content of caption, with variables: `{caption}`, `{location}`, `{likes}`, `{image}` | {caption} |

### Events

| Event | Description |
|---|---|
|`masongram:error`| Triggered when error detected |
|`masongram:api:end`| Triggered when reached end of API resources |

## Dependencies

- jQuery
- [Masonry](https://masonry.desandro.com/), jQuery plugin
- [ImagesLoaded](https://imagesloaded.desandro.com/), jQuery plugin

## Integrations

#### FancyBox (lightbox)

Within the demo page there is [FancyBox](http://fancyapps.com/fancybox/3/) jQuery plugin integration. This is an optional dependency, added for demo purposes only. 
