# Tail

Just a little practice exercise: two implementations of reading the last 10 lines of a file.

## Benchmarking

Using [hyperfine](https://github.com/sharkdp/hyperfine) to benchmark the difference between the two methods.

Benchmarked on a 963k `package-lock.json`.

Results:

- `stream` - 42ms
- `backwards` - 31ms

Most of that time is Node.js startup. For comparison, running `node log.js` which just runs `console.log("hello")` takes 27ms.

```text
> hyperfine 'node ./index.js SOME_PATH/package-lock.json stream' 'node ./index.js SOME_PATH/package-lock.json backwards'
Benchmark #1: node ./index.js SOME_PATH/package-lock.json stream
  Time (mean ± σ):      42.2 ms ±   1.0 ms    [User: 40.9 ms, System: 7.9 ms]
  Range (min … max):    40.8 ms …  44.6 ms    66 runs

Benchmark #2: node ./index.js SOME_PATH/package-lock.json backwards
  Time (mean ± σ):      31.0 ms ±   0.7 ms    [User: 28.8 ms, System: 3.7 ms]
  Range (min … max):    30.0 ms …  33.9 ms    90 runs

Summary
  'node ./index.js SOME_PATH/package-lock.json backwards' ran
    1.36 ± 0.04 times faster than 'node ./index.js SOME_PATH/package-lock.json stream'
```
