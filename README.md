# WWMC Map

A web-based mapping application for visualizing water monitoring and action data.

## Prerequisites

- Node.js (v16 or later recommended)
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
gulp
```

This will:
- Compile CoffeeScript files
- Process Handlebars templates
- Watch for file changes
- Start a local development server
- Open the application in your default browser

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

