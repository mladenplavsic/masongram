# MasonGram

jQuery plugin to add Instagram feed to a page.

## Features

- Simple
- Responsive
- Infinite loading while scrolling down
- FancyBox popup for viewing large image versions
- Infinite load while in FancyBox popup (new images added dynamically)
- Link to a location on map (configurable)
- Configurable image title, with "caption", "map", "likes" and "author" fields

## Usage

    $('#masongram').masongram();

### Options

| Option | Type | Configuration for | Description | Default  |
|---|---|---|---|---|
| `access_token` | `string` | Instagram API | Authorization (required) |  |
| `endpoint` | `string` | Instagram API | Endpoint of Instagram API media source | `users/self` |
| `count` | `number` | Instagram API | Number of results for one API request | `10` |
| `size` | `string` | Instagram API | Instagram image resolution: `low_resolution`, `standard_resolution` | `low_resolution` |
| `offset` | `number` | MasonGram | Distance from bottom of page where new API request is sent | `100` |
| `link` | `string` | MasonGram | Type of link to ge generated on image: `fancybox`, `map` | `fancybox` |
| `map` | `string` | MasonGram | Link with variables for map engine | `https://www.google.com/maps?q={map:latitude},{map:longitude}` |
| `columnWidth` | `number` | Masonry | Column width for Masonry brick | `324` |
| `title` | `object` | FancyBox | FancyBox title templating. See below details for each property |  |
| `title.html` | `string` | FancyBox | Main FancyBox title html. Available template elements: `{caption}`, `{likes}`,`{author}`,`{map}` | `{caption} {likes} {author} {map}` |
| `title.likes` | `string` | FancyBox | Template for displaying likes. Available template elements: `{likes:count}` | `&#9825; {likes:count}` |
| `title.author` | `string` | FancyBox | Template for displaying author. If value for `full_name` is not available, `username` will be used. Available template elements: `{author:username}`,`{author:full_name}` | `<a href="https://www.instagram.com/{author:username}" target="_blank">{author:full_name}</a>` |

### Events

| Event | Description |
|---|---|
|`masongram:error`| Triggered when error detected |
|`masongram:api:end`| Triggered when reached end of API resources |

## Dependencies

- jQuery
- InfiniteScroll (jQuery plugin)
- Masonry (jQuery plugin)
- ImagesLoaded (jQuery plugin)
- FancyBox (jQuery plugin)

