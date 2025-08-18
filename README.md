# WWMC Map

A web-based mapping application for visualizing water monitoring and action data.

## Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wwmc-map
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server with live reload:
```bash
npm run dev
```

## Building for Production

To create a production build:
```bash
npx gulp build
```

To publish the build to the AWS S3 bucket:
```bash
npx gulp publish
```

The production files will be generated in the `dist` directory.


## Features

- Interactive map visualization
- Water action tracking and display
- Data filtering and analysis
- Responsive design for various screen sizes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

