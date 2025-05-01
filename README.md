# WWMC Map

A web-based mapping application for visualizing water monitoring and action data.

## Prerequisites

- Node.js (v10 recommended)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wwmc-map
   ```

2. Install global dependencies:
   ```bash
   npm install -g gulp bower
   ```

3. Install project dependencies:
   ```bash
   npm install
   bower install
   ```

## Development

To start the development server with live reload:
```bash
gulp watch
```

This will:
- Run an initial build.
- Start a Webpack Dev Server on `http://localhost:3001`.
- Watch for file changes and trigger rebuilds.
- The server provides live reloading.

## Building for Production

To create a production build:
```bash
gulp build
```

The production files will be generated in the `dist` directory.

## Features

- Interactive map visualization
- Water action tracking and display
- Data filtering and analysis
- Responsive design for various screen sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

