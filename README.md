[![CI](https://github.com/larsmathuseck/Timeseries-Annotation/actions/workflows/ci.yml/badge.svg)](https://github.com/larsmathuseck/Timeseries-Annotation/actions/workflows/ci.yml)

![screenshot setup](docs/screenshot-setup.png)

# tf-annotator

Data annotation tool: [annotation.comtec.eecs.uni-kassel.de](https://annotation.comtec.eecs.uni-kassel.de/).

## Development
This project builds upon the [Nuxt.js](https://nuxtjs.org/) framework.

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).
Then run `pnpm i` to install the project's dependencies.
After that, use `pnpm dev` for development or `pnpm build` to generate the [static page](https://nuxtjs.org/blog/going-full-static).

Alternatively, build the provided [Dockerfile](https://www.docker.com/) using `docker build -t larsmathuseck/Timeseries-Annotation .` and run the resulting image using `docker run larsmathuseck/Timeseries-Annotation`.

## Screenshot
![screenshot annotator](docs/screenshot-annotator.png)
