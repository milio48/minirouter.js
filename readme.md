# Minirouter.js

Minirouter.js is an ultra-lightweight traditional router for creating minimalist front-end JavaScript projects.

**[Demo & Documentation](https://milio48.github.io/minirouter.js)**

### Description

A lightweight, pure JavaScript routing library that provides flexible navigation with powerful features for modern web applications.

### Features

*   Zero dependencies
*   Supports history and hash mode
*   Automatic `<a href>` interception and normalizer
*   File:// protocol compatibility
*   Customizable route handling
*   Query parameter extraction
*   Navigation hooks (before/after)

### Api

*   [new minirouterjs(baseUrl, hashMode)](#initializing)
*   [.go(path)](#route-by-function)
*   [.set(path, callback)](#set-path-examples)
*   [.setNotFound(callback)](#additional-routing-methods)
*   [.setBefore(callback)](#additional-routing-methods)
*   [.setAfter(callback)](#additional-routing-methods)
*   [.escapeHTML(string)](#xss-prevention)
*   [.unescapeHTML(string)](#xss-prevention)

### Warning

Minirouter.js handles only front-end routing. You will need to implement server-side routing separately.

- - -

# Basic Usage

### Installation

Include the library via CDN : 
[![](https://data.jsdelivr.com/v1/package/gh/milio48/minirouter.js/badge)](https://www.jsdelivr.com/package/gh/milio48/minirouter.js)

```html
<script src="https://cdn.jsdelivr.net/gh/milio48/minirouter.js@main/dist/v1/minirouter.min.js"></script>
```

Or download the source code from [Github minirouter.js](https://github.com/milio48/minirouter.js)

### HTML Example

```html
<a href="/">Home</a>
<a href="/user/1">User 1</a>
<a href="/notfound">404</a>

<!-- Disable router navigation for specific links -->
<a href="/unlist" data-router="false">unlist</a>
```

Minirouter.js will automatically listen and normalize path of href. Feel free to use relative paths like **../**.

### Route by function

```html
<button onclick="router.go('/dashboard')">Dashboard</button>
```

### Initializing

```javascript
// mode root domain (basic usage)
// expected http://localhost/
const router = new minirouterjs();

// non root domain
// expected http://localhost/folder
const router = new minirouterjs('/folder');

// hashes mode (support file:// protocol)
// expected http://127.0.0.1:5500/#/
// or file:///C:/www/project/file.html#/
// note : you cant combine hash mode with non root domain
const router = new minirouterjs('', true);
```

### Set Path Examples

```javascript
// expected http://localhost/
router.set('/', (params, target) => {
    console.log(params); // { "param": "/", "query": {} }
    console.log(target); // trigger element
});

// expected http://localhost/user/1
router.set('/user/:id', (params, target) => {
    console.log(params); //  { "param": "/user/1", "query": {}, "id": "1" }
    console.log(target); // trigger element
});
    
```

### Query Parameter Handling

```javascript
// expected http://localhost/get/alluser/?limit=50
router.set('/get/:data', (params, target) => {
    console.log(params);
    /*
    {
    "param": "/get/alluser/?limit=50",
    "query": {
        "limit": "50"
    },
    "data": "1"
    }
    */
    console.log(params.query.limit);
    console.log(target); // trigger element
});
    
```

### Additional Routing Methods

```javascript
// expected http://localhost/404
router.setNotFound((params, target) => {
    console.log('Not Found :' + params + target);
});

// will executed before navigate
// possible to check authentication
router.setBefore((path, target) => {
   console.log("Before Hook - Path:", path, "Target:", target);
});

// will executed after navigate
router.setAfter((path, target) => {
    console.log("After Hook - Path:", path, "Target:", target);
});
    
```

- - -

# Advanced Usage

### Non Root Domain

```javascript
// set base url to /folder
const router = new minirouterjs("/folder");

// expected http://localhost/folder as root
router.set('/', (params, target) => {
    console.log(params); // { "param": "/", "query": {} }
    console.log(target); // trigger element
});

// expected http://localhost/folder/docs
router.set('/docs', (params, target) => {
    console.log(params); // { "param": "/", "query": {} }
    console.log(target); // trigger element
});
    
```

If your domain is **http://localhost/folder**, you can set the base URL to **/folder** and still write routes as **/**.  
  
This means you can easily copy your project to any domain and it will work seamlessly by simply editing the base URL.  
  
The link **<a href="/user/1">User 1</a>** will automatically be normalized to **<a href="/folder/user/1">User 1</a>** . Enjoy the convenience!

  

### Hashes Mode & Non HTTP Domain (file:// protocol)

```javascript
// set base url to null and hashes mode to true
const router = new minirouterjs("", true);

// expected http://localhost/#/
router.set('/', (params, target) => {
    console.log(params); // { "param": "/", "query": {} }
    console.log(target); // trigger element
});

// expected http://localhost/#/docs
router.set('/docs', (params, target) => {
    console.log(params); // { "param": "/", "query": {} }
    console.log(target); // trigger element
});
    
```

This is useful for non-HTTP domains, such as **file:///C:/www/project/index.html#/docs**.  
The link **<a href="/docs/>Docs</a>** will also be automatically normalized.

  

### XSS Prevention

Minirouter.js provides **escapeHTML()** and **unescapeHTML()** methods to help prevent Cross-Site Scripting (XSS) attacks.

```javascript
// non escaped
// http://127.0.0.1:5500/data?limit=<h1>XSS</h1>
router.set('/data', (params, target) => {
    console.log(params);
    console.log(target);
    document.querySelector('#app').innerHTML = `<h1>Data</h1><p>Limit ${params.query.limit}</p>`;
    // coloring by querySelector
    document.querySelector('button[onclick*="/data"]').style.color = 'red';
});



// escaped html
router.set('/data', (params, target) => {
    console.log(params);
    console.log(target);

    let escaped = router.escapeHTML(params.query.limit);
    document.querySelector('#app').innerHTML = `<h1>Data</h1><p>Limit ${escaped}</p>`;
    console.log(router.unescapeHTML(escaped));
    // coloring by querySelector
    document.querySelector('button[onclick*="/data"]').style.color = 'red';
});

    
```

**Best Practices:**

*   Always escape user inputs before rendering
*   Prefer **innerText** or **textContent** when possible
*   Use escapeHTML() for rendering dynamic content
*   Use unescapeHTML() only when you need to retrieve the original content

- - -

# Example

*   [root-domain](https://github.com/milio48/minirouter.js/tree/main/example/root-domain)
*   [non-root-domain](https://github.com/milio48/minirouter.js/tree/main/example/nonroot-domain)
*   [hashmode](https://github.com/milio48/minirouter.js/tree/main/example/hashmode)