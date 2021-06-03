const readline = require("readline");
const chalk = require("chalk");
let _private = new WeakMap();
class Spinner {
  constructor(options = {}) {
    const that = this;
    const onTick = msg => {
      const columns = that.stream.columns;
      msg =
        (msg.length > columns ? msg.slice(0, columns - 3) + "..." : msg) + "\n";
      that.clearLine(that.stream, msg);
      that.stream.write(msg);
    };
    _private.set(that, {
      spinner: null,
      delay: options.delay || 60,
      interval: null,
      text: options.text || "",
      spinners: ["⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"],
      warn: "⚠",
      info: "ℹ",
      failed: "✖",
      success: "✔",
      color: "cyan",
      onTick: options.onTick || onTick,
      stream: options.stream || process.stdout
    });
    that.setSpinner(0);
  }
  get stream() {
    return _private.get(this).stream;
  }
  set stream(stream) {
    _private.get(this).stream = stream;
    return this;
  }
  set color(value) {
    _private.get(this).color = value;
  }
  clearLine(stream, msg) {
    // Cap message to one line
    const y =
      stream.columns > msg.length
        ? stream.rows
        : stream.rows - Math.round(msg.length / stream.columns);
    readline.cursorTo(stream, 0, y - 2);
    readline.clearLine(stream, 0);
    return this;
  }
  isSpinning() {
    return !!_private.get(this).interval;
  }
  setText(value) {
    _private.get(this).text = value;
    return this;
  }
  setSpinner(value) {
    let { spinners } = _private.get(this);
    _private.get(this).spinner = spinners[value];
    return this;
  }
  setDelay(value) {
    _private.get(this).delay = value;
    return this;
  }
  start() {
    let that = this;
    let { text, delay, spinner, onTick, color } = _private.get(that);
    let i = 0;
    let spin = () => {
      let char = spinner[i];
      let msg =
        text.indexOf("%s") > -1
          ? text.replace("%s", chalk[color](char))
          : `${chalk[color](char)} ${text}`;
      onTick(msg);
      i = ++i % spinner.length;
    };
    _private.get(that).interval = setInterval(spin, delay);
    return this;
  }
  stop(options) {
    let text = typeof options === "object" ? options.text || "" : options;
    let icon = typeof options === "object" ? options.icon || "" : "";
    let { interval, onTick } = _private.get(this);
    let msg =
      text.indexOf("%s") > -1
        ? text.replace("%s", icon || "")
        : `${icon} ${text}`;
    clearInterval(interval);
    _private.get(this).interval = null;
    onTick(msg + "\n");
  }
  failed(value) {
    let { text, failed } = _private.get(this);
    let options = {
      text: value || text,
      icon: chalk.red(failed)
    };
    this.stop(options);
  }
  warn(value) {
    let { text, warn } = _private.get(this);
    let options = {
      text: value || text,
      icon: chalk.orange(warn)
    };
    this.stop(options);
  }
  info(value) {
    let { text, info } = _private.get(this);
    let options = {
      text: value || text,
      icon: chalk.blue(info)
    };
    this.stop(options);
  }
  success(value) {
    let { text, success } = _private.get(this);
    let options = {
      text: value || text,
      icon: chalk.green(success)
    };
    this.stop(options);
  }
}
module.exports = Spinner;
