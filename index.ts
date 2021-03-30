import * as fs from "fs";
import * as fsP from "fs/promises";
import * as readline from "readline";

const args = process.argv.slice(2);

const filepath = args[0];
const method = args[1] ?? "backwards";

const NUM_LINES = 10;

if (fs.existsSync(filepath)) {
  switch (method) {
    case "stream":
      stream();
      break;

    case "backwards":
      backwards();
      break;

    default:
      throw new Error("No method selected");
  }
}

const BUFFER_SIZE = 1024;
const LINE_FEED_CHAR = 10;

// Does print final, empty line
async function backwards() {
  const stats = await fsP.stat(filepath);
  const handle = await fsP.open(filepath, "r");

  const lines = [];
  let leftover = Buffer.alloc(0);

  const buff = Buffer.alloc(BUFFER_SIZE);
  let totalBytesRead = 0;

  let buffNum = 1;
  read: do {
    // Starting from the end, read a single buffer's worth at a time
    const { bytesRead } = await handle.read(
      buff,
      0,
      Math.min(stats.size - totalBytesRead, BUFFER_SIZE),
      Math.max(0, stats.size - BUFFER_SIZE * buffNum)
    );
    totalBytesRead += bytesRead;

    // Look for newlines
    let end = bytesRead;
    for (let i = end - 1; i >= 0; i--) {
      if (buff[i] === LINE_FEED_CHAR) {
        // Found a newline, everything after this + any previous leftover is the lint
        const line = Buffer.concat([buff.slice(i + 1, end), leftover]);
        leftover = Buffer.alloc(0);

        lines.push(line);

        end = i;
        if (lines.length === NUM_LINES) {
          break read;
        }
      }
    }
    if (lines.length < NUM_LINES) {
      // Store any leftover bytes we haven't yet put into a line
      leftover = Buffer.concat([buff.slice(0, end), leftover]);
    }

    buffNum++;
  } while (totalBytesRead < stats.size);

  if (lines.length < NUM_LINES) {
    // The first line
    lines.push(leftover);
  }

  for (const line of lines.reverse()) {
    console.log(line.toString("utf8"));
  }
}

// Does not print final, empty line
function stream() {
  const stream = fs.createReadStream(filepath);
  const lineStream = readline.createInterface(stream);

  let next = 0;
  const lines = [];
  lineStream.on("line", (line) => {
    lines[next] = line;
    next = ++next % NUM_LINES;
  });

  lineStream.on("close", () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[(i + next) % NUM_LINES];
      console.log(line);
    }
  });
}
