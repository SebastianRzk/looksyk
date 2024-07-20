# Looksyk

A simple personal knowledge platform with a focus on clean markdown files, simple queries and a journal.

I have always been a fan of [Logseq](https://logseq.com/), but there were a few things that bothered me, such as the many control characters in the markdown files, the query language that is difficult to learn, or the general performance.
When the database version announced the move away from Markdown as the leading data storage format, I tried to write my own client: Looksyk (name may need to be changed).

## Current status of the project

**Project work and future**

The project is a little hobby of mine, and I program a few lines sometimes when I feel like it and have the time.

You can definitely try Looksyk out now, and once a deployment is ready, you can use it.

If you have any changes or suggestions, please send me a pull request.
For feature requests and bugs, you can submit an issue (or a pull request if you can).

**Technical concept**

With Looksyk I want to create a local platform to collect information.

Currently the backend renders all content in Markdown, which is displayed with [Marked](https://marked.js.org/) in the frontend. This makes Looksyk relatively close to the Markdown standard. Code highlighting is done with [highlightjs](https://highlightjs.org/).

Even if the project is currently a pure web project, I would not deploy it publicly because the project in its current state has not paid much attention to security (for example Injection-Attacks or Path-Traversal-Attacks).

Currently the backend is very fast, my [Logseq](https://logseq.com/) markdown files (~900 pages and 900kb text) are scanned and indexed in under a second. That's why Looksyk doesn't have a database, reading new data into RAM is fast enough.

The frontend still has some challenges. Performance can be improved and sometimes scrolling on the journal page has issues.

## Roadmap

### MVP

* ☑ Done: Pages
  * Links `[[a link]]`
  * Code highlighting
  * File upload (and automatic de-duplication on insert)
  * Special page: wiki overview
* ☑ Done: Journal
  * Infinite scroll (not optimized)
* ☑ Done: Todos
  * With `[ ] -> todo, [x] -> done`
* ☑ Done: Queries
  * Query type: `page-hierarchy`
  * Query type: `todos`
  * Query type: `references-to`
  * Display-type: `count`, `inplace-list`, `referenced-list`
* ☑ Done: Favourites


### Next steps

* Todo: fix encoding when tags contain special characters
* Todo: Page
  * Rename pages / tags
  * Page properites
  * Page icons
  * Delete page
  * Custom page properties
* Todo: Queries
  * Query type: `page-by-property` (list pages with a certain property)
  * Query type: `insert-content-from-file` (insert content from a asset file)
  * Improve query error messages
* Todo: Deployment
  * Native build
* Todo: Favourites
  * Reorder list in sidebar
* Todo: Design
  * Extract variables in CSS for key elements (for easy theming)
  * Change and embed fonts


### Vision

* Page templates
  * Default template for journal page
  * Template variables
* Journal
  * Calendar view
  * Week view
* Media index page
  * Show all media
  * Scale down images
* Queries
  * Query type: `toc`
  * Query type: `block-based-query`
  * Query type: `media`
  * Query parameter `from` `to` (journal)
* Quality of life
  * Shortcut delete block
  * Editor assist inserting queries and tags
  * Settings page
* CSS themes
* Render charts

### Out of scope
* Non-Markdown content (e.g. flashcards, whiteboards)
* PDF annotation
* Dynamic backend plugins
* Server version / multi user / rcs
* i18n


## Try it out

### Development Build

1. Clone the repository
2. Install frontend dependencies and run `cd frontend`, `npm install`, `ng serve`
3. Install backend dependencies and run `cd backend` and `cargo run`


### Try it out with your Logseq-Mardown data

1. Copy your journals into the journal folder (`backend/data/journals`)
2. Copy your pages into the pages folder (`backend/data/pages`)
3. Copy your assets into the assets folder (`backend/data/assets`)
4. Start / Restart the backend

### Production Build

TODO

## Basic commands

* `[[a link]]` creates a link to a page
* `[ ]` creates a todo
* `[x]` marks a todo as done
* Ctrl+Enter creates a new block
* 

## Queries

Currently, queries must be inserted exactly as described. Parameters cannot (yet) be swapped or omitted.

### Page Hierarchy

```
 Show a list of links
 {query: page-hierarchy root:"myRootTag" display:"inplace-list"}
 
 Show the count
 {query: page-hierarchy root:"myRootTag" display:"count"}
```


### Todos

```
 Show a list of todos with a checkbox and a link to the source file. The list is appended to the end of the current block
 {query: todos tag:"myTag" state:"todo" display:"referenced-list"}
 
 Show a list of todos (not modifiable, but renders in place)
 {query: todos tag:"myTag" state:"todo" display:"inplace-list"}
 
 Show the count of todos
 {query: todos tag:"myTag" state:"todo" display:"count"}
 
 Show done todos
 {query: todos tag:"myTag" state:"done" display:"referenced-list"}
```


### Backlinks

```
 Show a list of backlinks
 {query: references-to tag:"myTag" display:"referenced-list"}
 
 Show the count
 {query: references-to tag:"myTag" display:"count"}
```
