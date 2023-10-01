<p align="center">
  <img width="100" height="100" src="https://gcdnb.pbrd.co/images/4MfTISixMtYY.png" alt="anyfeed logo">
</p>

<h3 align="center">Anyfeed</h3>
<p align="center">Open-source and self-hosted solution that assists developers in staying up-to-date with the latest industry trends. It leverages RSS feeds and content recognition algorithms to provide a comprehensive range of content to follow.</p>
<br />

<p align="center">
  <a href="https://www.npmjs.org/package/nfd">
    <img src="https://img.shields.io/npm/v/nfd/latest.svg" alt="NPM Version" />
  </a>
</p>

<br>

## Getting Started

Make sure you're using the LTS version of Node.js (v18).

```bash
npm i -g nfd
nfd
```

<br>

<p align="center">
    <img src="https://gcdnb.pbrd.co/images/4VROoVyysP4y.png" alt="home page" />
</p>

<p align="center">
    <img src="https://gcdnb.pbrd.co/images/p0WpJNnHej2w.png" alt="intro - github" />
</p>

<p align="center">
    <img src="https://gcdnb.pbrd.co/images/gMftaDVfjE1y.png" alt="intro - keywords" />
</p>

<p align="center">
    <img src="https://gcdnb.pbrd.co/images/uBkEMFVkME5u.png" alt="intro - platforms" />
</p>

<br>

## Features

- Optimized for tech-oriented content (GitHub, HN, Hugging Face...)
- Internally uses a headless browser to get any content available on the web
- Modern UI allowing you to navigate through your feeds in a breeze using gestures/keyboard
- Uses a cron job to update your feeds on a regular basis, so you always have fresh content to read
- The CLI provides a detached mode, allowing you to run it in the background on your home server
- You can "star" posts to retrieve them later
- Reorganize your feeds easily with drag and drop
- Advanced personalization of your feeds, ability to exclude them from showing up on your home page

<br>

## Roadmap

- Tests
- A11y (Anyfeed started as a tool for myself, so I didn't spend time on this. Now that I'm sharing it with the community, one of my priorities is to make it accessible.)
- Auth
- Group multiple feeds
- Inclusion/exclusion rules for feed updates
- Image caching
- Search
- Plugins (What if you could get more than just articles in your feeds? For example, emails, todos, anything?)
- Multi-users

And, of course, there are a lot of possibilities. For instance, using LLM to get a daily summary of your feeds, desktop/mobile apps... It will all depend on the feedback I receive from the community.

<br>

## License

MIT License

Copyright (c) 2023 Eddy Bordi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
