# DevPocket

DevPocket is a lightweight, browser-based toolbox for everyday developer tasks. Format data, generate secure identifiers, convert encodings and colors, or get a quick text breakdown — without sending input to a server.

## Features

- **JSON formatter** — format with 2-space, 4-space, or tab indentation; minify; validate; and copy output.
- **UUID generator** — generate up to 100 UUID v4 values using the browser's cryptographically secure API.
- **Base64 converter** — encode and decode UTF-8 text, including Unicode; invalid Base64 and invalid UTF-8 are reported.
- **Text analyzer** — live word, character, no-space character, line, and estimated reading-time counts.
- **Color converter** — convert HEX to RGB or HSL, and RGB to HEX or HSL, with a live preview and input validation.
- **Timestamp converter** — convert Unix timestamps in seconds or milliseconds to ISO dates and dates back to timestamps.
- Responsive navigation, tool search, keyboard shortcut (`⌘ K` / `Ctrl K`), clipboard actions, and accessible status notifications.

## Technologies

DevPocket uses HTML5, CSS3, and vanilla JavaScript ES modules. Automated tests run with Node.js's built-in test runner. There are no runtime dependencies or build step.

## Project structure

```text
DevPocket/
├── index.html
├── README.md
├── LICENSE
├── package.json
├── .gitignore
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── pages.yml
├── src/
│   ├── app.js
│   ├── styles.css
│   ├── tools/
│   │   ├── json.js
│   │   ├── uuid.js
│   │   ├── base64.js
│   │   ├── text.js
│   │   ├── color.js
│   │   └── timestamp.js
│   └── utils/
│       └── clipboard.js
├── tests/
│   └── tools.test.js
```

## Installation and local use

1. Install Node.js 18 or newer to run the test suite.
2. Clone the repository and enter its directory.
3. Serve the static files from the project root. For example, with Python installed:

   ```sh
   python3 -m http.server 8000
   ```

4. Open [http://localhost:8000](http://localhost:8000).

ES modules should be served over HTTP rather than opened directly with `file://`. No `npm install` is required. Clipboard access is subject to browser permissions and secure-context rules; localhost is treated as a secure context by modern browsers.

## Usage

Choose a tool from the sidebar or the overview cards. Use the controls in each workspace to process the input. The timestamp converter supports seconds and milliseconds, and converts dates entered in the browser's local time zone or as ISO date-time strings with an explicit offset. All conversion and analysis logic runs locally in the page. Tools report invalid input in the workspace and through a notification. UUIDs are generated on demand and are not stored.

## Running tests

```sh
npm test
```

The suite covers formatting and invalid JSON, UUID v4 generation, Base64 and Unicode handling, text statistics, color conversions, timestamp conversion and validation, and invalid colors.

GitHub Actions runs this suite on Node.js 18, 20, and 22 for pushes and pull requests targeting `main`.

## License

Released under the [MIT License](./LICENSE).
