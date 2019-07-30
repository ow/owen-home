# owen

 My website, running [here](https://owenwillia.ms) and a handy starter/template for anyone looking to build a portfolio/freelance website. You can use this to build your own site!

![https://i.char.gd/2019/07/chrome_2019-07-30_11-42-47.png](https://i.char.gd/2019/07/chrome_2019-07-30_11-42-47.png)

## Prerequisites

To install this project, you'll need the following things installed on your machine.

1. [Jekyll](http://jekyllrb.com/).
2. [NodeJS](http://nodejs.org) - use the installer.

## Local Installation

1. Clone this repo, or download it into a directory of your choice.
2. Inside the directory, run `npm install`.
3. Code away! 

## Usage

**Development mode**

This will give you file watching, browser synchronisation, auto-rebuild, CSS injecting etc. It's pretty badly configured at the moment, but it works! 

```shell
$ npm run start
```

**Deploy mode**

You can easily deploy your site build with the command
```shell
$ npm run deploy
```

## License

Feel free to use my theme, but please do not use my images, logo or other copy on your own site. **In order to license this code, the only thing I require you to do is link back to this repository in the footer like this: `[Site style created by Owen Williams.](https://github.com/ow/owen-home)`** 

For context: this is built on top of Jekyll, Bootstrap 4, and my own custom CSS. To change things around, just start in main.scss, and tweak the brand colors there.

The data for everything is stored in either config.yml, or in a custom collection such as `_work` directory. The only exception is the brand logos, which are currently hard-coded.
